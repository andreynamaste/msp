#!/usr/bin/env python3
"""
WordPress MCP Server using FastMCP for OpenAI and ChatGPT
Works on mcp.2msp.online with SSL certificate
"""

import asyncio
import json
import logging
from typing import Optional, Dict, Any

import httpx
from mcp.server.fastmcp import FastMCP
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from sse_starlette import EventSourceResponse, ServerSentEvent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========================================
# CONFIGURATION - UPDATE THESE VALUES
# ========================================
WORDPRESS_URL = "https://your-wordpress-site.com/"
WORDPRESS_USERNAME = "your-username"
WORDPRESS_PASSWORD = "your-password"

# Global WordPress client instance
wp_client: Optional[httpx.AsyncClient] = None


class WordPressMCP:
    """WordPress MCP client for managing WordPress posts via REST API"""
    
    def __init__(self, url: str, username: str, password: str):
        """
        Initialize WordPress MCP client
        
        Args:
            url: WordPress site URL
            username: WordPress username
            password: WordPress application password
        """
        self.url = url.rstrip('/') + '/wp-json/wp/v2'
        self.client = httpx.AsyncClient(
            auth=(username, password),
            timeout=30.0,
            headers={'Content-Type': 'application/json'}
        )
        logger.info(f"WordPress MCP client initialized for {url}")
    
    async def create_post(
        self, 
        title: str, 
        content: str, 
        excerpt: str = "", 
        status: str = "publish"
    ) -> Dict[str, Any]:
        """
        Create a new WordPress post
        
        Args:
            title: Post title
            content: Post content (HTML)
            excerpt: Post excerpt
            status: Post status (publish, draft, private)
            
        Returns:
            Dictionary with success status, post_id, url, and message
        """
        try:
            logger.info(f"Creating post: {title}")
            
            data = {
                "title": title,
                "content": content,
                "excerpt": excerpt,
                "status": status
            }
            
            response = await self.client.post(
                f"{self.url}/posts",
                json=data
            )
            response.raise_for_status()
            
            result = response.json()
            post_id = result.get('id')
            post_url = result.get('link')
            
            logger.info(f"Post created successfully: ID={post_id}, URL={post_url}")
            
            return {
                "success": True,
                "post_id": post_id,
                "url": post_url,
                "message": f"Post '{title}' created successfully"
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to create post: {e}")
            return {
                "success": False,
                "post_id": None,
                "url": None,
                "message": f"Error creating post: {str(e)}"
            }
    
    async def update_post(
        self, 
        post_id: int, 
        title: Optional[str] = None,
        content: Optional[str] = None,
        excerpt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update an existing WordPress post
        
        Args:
            post_id: Post ID to update
            title: New post title (optional)
            content: New post content (optional)
            excerpt: New post excerpt (optional)
            
        Returns:
            Dictionary with success status, post_id, url, and message
        """
        try:
            logger.info(f"Updating post ID: {post_id}")
            
            data = {}
            if title is not None:
                data["title"] = title
            if content is not None:
                data["content"] = content
            if excerpt is not None:
                data["excerpt"] = excerpt
            
            if not data:
                return {
                    "success": False,
                    "post_id": post_id,
                    "url": None,
                    "message": "No fields to update"
                }
            
            response = await self.client.post(
                f"{self.url}/posts/{post_id}",
                json=data
            )
            response.raise_for_status()
            
            result = response.json()
            post_url = result.get('link')
            
            logger.info(f"Post updated successfully: ID={post_id}, URL={post_url}")
            
            return {
                "success": True,
                "post_id": post_id,
                "url": post_url,
                "message": f"Post {post_id} updated successfully"
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to update post: {e}")
            return {
                "success": False,
                "post_id": post_id,
                "url": None,
                "message": f"Error updating post: {str(e)}"
            }
    
    async def get_posts(
        self, 
        per_page: int = 10, 
        page: int = 1
    ) -> Dict[str, Any]:
        """
        Get list of WordPress posts
        
        Args:
            per_page: Number of posts per page (1-100)
            page: Page number
            
        Returns:
            Dictionary with success status, posts list, count, and message
        """
        try:
            logger.info(f"Getting posts: per_page={per_page}, page={page}")
            
            params = {
                "per_page": min(max(per_page, 1), 100),
                "page": max(page, 1)
            }
            
            response = await self.client.get(
                f"{self.url}/posts",
                params=params
            )
            response.raise_for_status()
            
            posts = response.json()
            
            # Extract relevant post information
            post_list = []
            for post in posts:
                post_list.append({
                    "id": post.get('id'),
                    "title": post.get('title', {}).get('rendered', ''),
                    "excerpt": post.get('excerpt', {}).get('rendered', ''),
                    "url": post.get('link'),
                    "status": post.get('status'),
                    "date": post.get('date')
                })
            
            logger.info(f"Retrieved {len(post_list)} posts")
            
            return {
                "success": True,
                "posts": post_list,
                "count": len(post_list),
                "message": f"Retrieved {len(post_list)} posts"
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to get posts: {e}")
            return {
                "success": False,
                "posts": [],
                "count": 0,
                "message": f"Error getting posts: {str(e)}"
            }
    
    async def delete_post(self, post_id: int) -> Dict[str, Any]:
        """
        Delete a WordPress post
        
        Args:
            post_id: Post ID to delete
            
        Returns:
            Dictionary with success status, post_id, and message
        """
        try:
            logger.info(f"Deleting post ID: {post_id}")
            
            response = await self.client.delete(
                f"{self.url}/posts/{post_id}"
            )
            response.raise_for_status()
            
            logger.info(f"Post deleted successfully: ID={post_id}")
            
            return {
                "success": True,
                "post_id": post_id,
                "message": f"Post {post_id} deleted successfully"
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to delete post: {e}")
            return {
                "success": False,
                "post_id": post_id,
                "message": f"Error deleting post: {str(e)}"
            }
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
        logger.info("WordPress MCP client closed")


# Initialize FastMCP server
# Using streamable_http_path="/mcp" for production deployment
mcp = FastMCP(
    "WordPress MCP Server",
    instructions="WordPress MCP Server for managing WordPress posts via ChatGPT",
    streamable_http_path="/mcp",
    sse_path="/sse"
)

# Initialize WordPress client
wp_client_instance: Optional[WordPressMCP] = None

# Initialize WordPress client on module load
logger.info("Initializing WordPress MCP client...")
wp_client_instance = WordPressMCP(WORDPRESS_URL, WORDPRESS_USERNAME, WORDPRESS_PASSWORD)


@mcp.tool()
async def create_post(
    title: str,
    content: str,
    excerpt: str = "",
    status: str = "publish"
) -> str:
    """
    Create a new WordPress post on your site
    
    Args:
        title: Post title
        content: Post content in HTML
        excerpt: Post excerpt (optional)
        status: Post status - "publish", "draft", or "private" (default: "publish")
    
    Returns:
        JSON string with success status, post_id, url, and message
    """
    if not wp_client_instance:
        return json.dumps({"success": False, "message": "WordPress client not initialized"})
    
    result = await wp_client_instance.create_post(title, content, excerpt, status)
    return json.dumps(result, ensure_ascii=False)


@mcp.tool()
async def update_post(
    post_id: int,
    title: Optional[str] = None,
    content: Optional[str] = None,
    excerpt: Optional[str] = None
) -> str:
    """
    Update an existing WordPress post
    
    Args:
        post_id: Post ID to update (required)
        title: New post title (optional)
        content: New post content in HTML (optional)
        excerpt: New post excerpt (optional)
    
    Returns:
        JSON string with success status, post_id, url, and message
    """
    if not wp_client_instance:
        return json.dumps({"success": False, "message": "WordPress client not initialized"})
    
    result = await wp_client_instance.update_post(post_id, title, content, excerpt)
    return json.dumps(result, ensure_ascii=False)


@mcp.tool()
async def get_posts(
    per_page: int = 10,
    page: int = 1
) -> str:
    """
    Get list of WordPress posts
    
    Args:
        per_page: Number of posts per page (1-100, default: 10)
        page: Page number (default: 1)
    
    Returns:
        JSON string with success status, posts list, count, and message
    """
    if not wp_client_instance:
        return json.dumps({"success": False, "message": "WordPress client not initialized"})
    
    result = await wp_client_instance.get_posts(per_page, page)
    return json.dumps(result, ensure_ascii=False)


@mcp.tool()
async def delete_post(post_id: int) -> str:
    """
    Delete a WordPress post
    
    Args:
        post_id: Post ID to delete (required)
    
    Returns:
        JSON string with success status, post_id, and message
    """
    if not wp_client_instance:
        return json.dumps({"success": False, "message": "WordPress client not initialized"})
    
    result = await wp_client_instance.delete_post(post_id)
    return json.dumps(result, ensure_ascii=False)


# Create FastAPI app for additional endpoints (health check, info)
app = FastAPI(
    title="WordPress MCP Server",
    description="MCP Server for managing WordPress posts via ChatGPT",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Server information endpoint"""
    return {
        "name": "WordPress MCP Server",
        "version": "1.0.0",
        "protocol": "MCP over Streamable HTTP / SSE",
        "endpoints": {
            "/": "Server information",
            "/health": "Health check",
            "/sse": "SSE endpoint for ChatGPT connection (legacy)",
            "/mcp": "Streamable HTTP endpoint for ChatGPT (recommended)"
        },
        "tools": [
            {
                "name": "create_post",
                "description": "Create a new WordPress post on your site"
            },
            {
                "name": "update_post",
                "description": "Update an existing WordPress post"
            },
            {
                "name": "get_posts",
                "description": "Get list of WordPress posts"
            },
            {
                "name": "delete_post",
                "description": "Delete a WordPress post"
            }
        ],
        "url": "https://mcp.2msp.online"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "wordpress-mcp-server",
        "wordpress_configured": wp_client_instance is not None
    }


@app.get("/msp")
async def msp_redirect():
    """Redirect /msp to /mcp (common typo)"""
    return RedirectResponse(url="/mcp", status_code=301)


# Create proper MCP SSE endpoint that handles the MCP protocol
@app.api_route("/sse", methods=["GET", "POST", "OPTIONS"])
async def sse_endpoint(request: Request):
    """
    SSE endpoint for MCP protocol
    Handles ChatGPT MCP connections via Server-Sent Events
    """
    logger.info(f"SSE request: {request.method} from {request.client}")
    
    async def event_generator():
        """Generate SSE events for MCP protocol"""
        try:
            # Read request body if POST
            if request.method == "POST":
                try:
                    body = await request.body()
                    if body:
                        data = json.loads(body)
                        logger.info(f"MCP Request: {data}")
                        
                        # Handle MCP initialize
                        if data.get("method") == "initialize":
                            response = {
                                "jsonrpc": "2.0",
                                "id": data.get("id"),
                                "result": {
                                    "protocolVersion": "2024-11-05",
                                    "serverInfo": {
                                        "name": "WordPress MCP Server",
                                        "version": "1.0.0"
                                    },
                                    "capabilities": {
                                        "tools": {}
                                    }
                                }
                            }
                            yield ServerSentEvent(
                                data=json.dumps(response),
                                event="message"
                            )
                        
                        # Handle tools/list
                        elif data.get("method") == "tools/list":
                            tools_list = [
                                {
                                    "name": "create_post",
                                    "description": "Create a new WordPress post",
                                    "inputSchema": {
                                        "type": "object",
                                        "properties": {
                                            "title": {"type": "string"},
                                            "content": {"type": "string"},
                                            "status": {"type": "string", "enum": ["publish", "draft"]}
                                        },
                                        "required": ["title", "content"]
                                    }
                                },
                                {
                                    "name": "update_post",
                                    "description": "Update an existing WordPress post",
                                    "inputSchema": {
                                        "type": "object",
                                        "properties": {
                                            "post_id": {"type": "integer"},
                                            "title": {"type": "string"},
                                            "content": {"type": "string"},
                                            "status": {"type": "string"}
                                        },
                                        "required": ["post_id"]
                                    }
                                },
                                {
                                    "name": "get_posts",
                                    "description": "Get list of WordPress posts",
                                    "inputSchema": {
                                        "type": "object",
                                        "properties": {
                                            "per_page": {"type": "integer", "default": 10},
                                            "page": {"type": "integer", "default": 1},
                                            "status": {"type": "string"}
                                        }
                                    }
                                },
                                {
                                    "name": "delete_post",
                                    "description": "Delete a WordPress post",
                                    "inputSchema": {
                                        "type": "object",
                                        "properties": {
                                            "post_id": {"type": "integer"}
                                        },
                                        "required": ["post_id"]
                                    }
                                }
                            ]
                            
                            response = {
                                "jsonrpc": "2.0",
                                "id": data.get("id"),
                                "result": {
                                    "tools": tools_list
                                }
                            }
                            yield ServerSentEvent(
                                data=json.dumps(response),
                                event="message"
                            )
                        
                        # Handle tools/call
                        elif data.get("method") == "tools/call":
                            tool_name = data.get("params", {}).get("name")
                            arguments = data.get("params", {}).get("arguments", {})
                            
                            # Map tool calls to WordPress MCP methods
                            tools_map = {
                                "create_post": wp_mcp.create_post,
                                "update_post": wp_mcp.update_post,
                                "get_posts": wp_mcp.get_posts,
                                "delete_post": wp_mcp.delete_post
                            }
                            
                            if tool_name in tools_map:
                                try:
                                    result = await tools_map[tool_name](**arguments)
                                    response = {
                                        "jsonrpc": "2.0",
                                        "id": data.get("id"),
                                        "result": {
                                            "content": [
                                                {
                                                    "type": "text",
                                                    "text": json.dumps(result, ensure_ascii=False, indent=2)
                                                }
                                            ]
                                        }
                                    }
                                except Exception as e:
                                    logger.error(f"Tool execution error: {e}")
                                    response = {
                                        "jsonrpc": "2.0",
                                        "id": data.get("id"),
                                        "error": {
                                            "code": -32603,
                                            "message": str(e)
                                        }
                                    }
                            else:
                                response = {
                                    "jsonrpc": "2.0",
                                    "id": data.get("id"),
                                    "error": {
                                        "code": -32601,
                                        "message": f"Tool not found: {tool_name}"
                                    }
                                }
                            
                            yield ServerSentEvent(
                                data=json.dumps(response),
                                event="message"
                            )
                        
                        return
                        
                except json.JSONDecodeError:
                    logger.warning("Invalid JSON in request body")
            
            # For GET or empty POST, send server info
            yield ServerSentEvent(
                data=json.dumps({
                    "jsonrpc": "2.0",
                    "method": "server/info",
                    "params": {
                        "name": "WordPress MCP Server",
                        "version": "1.0.0",
                        "protocolVersion": "2024-11-05"
                    }
                }),
                event="message"
            )
            
            # Keep connection alive with periodic pings
            while True:
                await asyncio.sleep(30)
                yield ServerSentEvent(data="ping", event="ping")
                
        except Exception as e:
            logger.error(f"SSE error: {e}")
            yield ServerSentEvent(
                data=json.dumps({"error": str(e)}),
                event="error"
            )
    
    return EventSourceResponse(event_generator())

# Add GET endpoint for MCP info at /mcp-info (to avoid conflicts with /mcp mount)
@app.get("/mcp-info", response_class=HTMLResponse)
async def mcp_info_get():
    """Beautiful information page about MCP endpoint"""
    
    html_content = """
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WordPress MCP Server</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .container {
                max-width: 800px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                padding: 40px;
                backdrop-filter: blur(10px);
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .logo {
                font-size: 60px;
                margin-bottom: 10px;
            }
            
            h1 {
                color: #667eea;
                font-size: 32px;
                margin-bottom: 10px;
            }
            
            .subtitle {
                color: #666;
                font-size: 18px;
            }
            
            .status {
                display: inline-block;
                background: #10b981;
                color: white;
                padding: 8px 20px;
                border-radius: 20px;
                font-weight: 600;
                margin-top: 15px;
            }
            
            .section {
                margin-bottom: 30px;
            }
            
            .section-title {
                color: #667eea;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .icon {
                font-size: 24px;
            }
            
            .card {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
            }
            
            .url-box {
                background: #667eea;
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                font-family: 'Monaco', 'Courier New', monospace;
                font-size: 16px;
                margin: 10px 0;
                word-break: break-all;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .url-box:hover {
                background: #5568d3;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
            }
            
            .tools-list {
                list-style: none;
            }
            
            .tool-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 10px;
                border-left: 4px solid #667eea;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .tool-icon {
                font-size: 24px;
                min-width: 30px;
            }
            
            .tool-content {
                flex: 1;
            }
            
            .tool-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 5px;
            }
            
            .tool-desc {
                color: #666;
                font-size: 14px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .info-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
            
            .info-label {
                color: #666;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
            }
            
            .info-value {
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 30px;
                border-top: 2px solid #e5e7eb;
                color: #666;
            }
            
            .btn {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 10px 5px;
                transition: all 0.3s;
            }
            
            .btn:hover {
                background: #5568d3;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .pulse {
                animation: pulse 2s infinite;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🤖</div>
                <h1>WordPress MCP Server</h1>
                <p class="subtitle">Model Context Protocol для ChatGPT</p>
                <div class="status">✓ Готов к работе</div>
            </div>
            
            <div class="section">
                <div class="section-title">
                    <span class="icon">🔗</span>
                    Подключение к ChatGPT
                </div>
                <div class="card">
                    <p style="margin-bottom: 10px; color: #666;">Используйте этот URL в ChatGPT Connectors:</p>
                    <div class="url-box" onclick="copyToClipboard('https://2msp.online/sse')" title="Нажмите для копирования">
                        https://2msp.online/sse
                    </div>
                    <p style="font-size: 14px; color: #999; margin-top: 10px;">
                        💡 Нажмите на URL для копирования
                    </p>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">
                    <span class="icon">⚙️</span>
                    Информация о сервере
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Протокол</div>
                        <div class="info-value">MCP over SSE</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Endpoint</div>
                        <div class="info-value">/sse</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Статус</div>
                        <div class="info-value" style="color: #10b981;">● Активен</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Инструменты</div>
                        <div class="info-value">4</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">
                    <span class="icon">🛠️</span>
                    Доступные инструменты
                </div>
                <ul class="tools-list">
                    <li class="tool-item">
                        <span class="tool-icon">➕</span>
                        <div class="tool-content">
                            <div class="tool-name">create_post</div>
                            <div class="tool-desc">Создать новый пост на WordPress</div>
                        </div>
                    </li>
                    <li class="tool-item">
                        <span class="tool-icon">✏️</span>
                        <div class="tool-content">
                            <div class="tool-name">update_post</div>
                            <div class="tool-desc">Обновить существующий пост</div>
                        </div>
                    </li>
                    <li class="tool-item">
                        <span class="tool-icon">📋</span>
                        <div class="tool-content">
                            <div class="tool-name">get_posts</div>
                            <div class="tool-desc">Получить список постов</div>
                        </div>
                    </li>
                    <li class="tool-item">
                        <span class="tool-icon">🗑️</span>
                        <div class="tool-content">
                            <div class="tool-name">delete_post</div>
                            <div class="tool-desc">Удалить пост</div>
                        </div>
                    </li>
                </ul>
            </div>
            
            <div class="section">
                <div class="section-title">
                    <span class="icon">📚</span>
                    Быстрый старт
                </div>
                <div class="card">
                    <p style="margin-bottom: 15px; color: #666;"><strong>1.</strong> Откройте ChatGPT</p>
                    <p style="margin-bottom: 15px; color: #666;"><strong>2.</strong> Settings → Connectors → New Connector</p>
                    <p style="margin-bottom: 15px; color: #666;"><strong>3.</strong> Введите URL: <code style="background: #e5e7eb; padding: 2px 8px; border-radius: 4px;">https://2msp.online/sse</code></p>
                    <p style="margin-bottom: 15px; color: #666;"><strong>4.</strong> Authentication: <strong>No authentication</strong></p>
                    <p style="color: #666;"><strong>5.</strong> Готово! Попросите ChatGPT создать пост</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://2msp.online/mcp-health" class="btn">Health Check</a>
                <a href="https://2msp.online/" class="btn">Главная</a>
            </div>
            
            <div class="footer">
                <p>WordPress MCP Server v1.0 • 2025</p>
                <p style="margin-top: 10px; font-size: 14px;">
                    Работает на <strong>2msp.online</strong>
                </p>
            </div>
        </div>
        
        <script>
            function copyToClipboard(text) {
                navigator.clipboard.writeText(text).then(function() {
                    // Показываем уведомление
                    const notification = document.createElement('div');
                    notification.textContent = '✓ URL скопирован!';
                    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 9999; font-weight: 600;';
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        notification.style.transition = 'opacity 0.3s';
                        notification.style.opacity = '0';
                        setTimeout(() => notification.remove(), 300);
                    }, 2000);
                }, function(err) {
                    alert('Не удалось скопировать URL');
                });
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


if __name__ == "__main__":
    logger.info("Starting WordPress MCP Server on port 8000...")
    logger.info("SSE endpoint: http://localhost:8000/sse")
    logger.info("Streamable HTTP endpoint: http://localhost:8000/mcp")
    logger.info("Production URL: https://mcp.2msp.online")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
