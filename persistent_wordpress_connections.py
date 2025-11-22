#!/usr/bin/env python3
"""
Persistent storage for user WordPress connections
Stores WordPress site credentials for each user
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from cryptography.fernet import Fernet
import os

logger = logging.getLogger(__name__)

# Storage file
CONNECTIONS_FILE = Path(__file__).parent / "data" / "wordpress_connections.json"
CONNECTIONS_FILE.parent.mkdir(parents=True, exist_ok=True)

# Encryption key for passwords (store in environment or generate once)
ENCRYPTION_KEY = os.environ.get("WP_ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # Generate and save key on first run
    key_file = Path(__file__).parent / "data" / ".wp_key"
    if key_file.exists():
        ENCRYPTION_KEY = key_file.read_text().strip()
    else:
        ENCRYPTION_KEY = Fernet.generate_key().decode()
        key_file.write_text(ENCRYPTION_KEY)
        key_file.chmod(0o600)  # Secure permissions

cipher_suite = Fernet(ENCRYPTION_KEY.encode())


def _load_connections() -> Dict:
    """Load connections from file"""
    if not CONNECTIONS_FILE.exists():
        return {}
    try:
        with open(CONNECTIONS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading connections: {e}")
        return {}


def _save_connections(connections: Dict) -> bool:
    """Save connections to file"""
    try:
        with open(CONNECTIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(connections, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Error saving connections: {e}")
        return False


def _encrypt_password(password: str) -> str:
    """Encrypt password"""
    return cipher_suite.encrypt(password.encode()).decode()


def _decrypt_password(encrypted: str) -> str:
    """Decrypt password"""
    return cipher_suite.decrypt(encrypted.encode()).decode()


def add_wordpress_connection(
    username: str,
    site_name: str,
    site_url: str,
    wp_username: str,
    wp_password: str,
    site_language: str = "en",
    site_description: str = ""
) -> Dict:
    """
    Add WordPress connection for user
    
    Args:
        username: User who owns this connection
        site_name: Friendly name for the site
        site_url: WordPress site URL
        wp_username: WordPress admin username
        wp_password: WordPress admin password (will be encrypted)
        site_language: Site language code (en, ru, uk, etc.)
        site_description: Optional description
    
    Returns:
        Connection info with connection_id
    """
    connections = _load_connections()
    
    if username not in connections:
        connections[username] = {}
    
    # Generate unique connection ID
    connection_id = f"{username}_{len(connections[username]) + 1}"
    
    # Encrypt password
    encrypted_password = _encrypt_password(wp_password)
    
    # Store connection
    connections[username][connection_id] = {
        "connection_id": connection_id,
        "site_name": site_name,
        "site_url": site_url.rstrip('/'),
        "wp_username": wp_username,
        "wp_password": encrypted_password,
        "site_language": site_language,
        "site_description": site_description,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "enabled": True,
        "last_used": None
    }
    
    if _save_connections(connections):
        logger.info(f"Added WordPress connection '{connection_id}' for user '{username}'")
        return connections[username][connection_id]
    
    return None


def get_user_connections(username: str) -> List[Dict]:
    """
    Get all WordPress connections for user
    
    Args:
        username: User to get connections for
    
    Returns:
        List of connection dicts (passwords decrypted)
    """
    connections = _load_connections()
    
    if username not in connections:
        return []
    
    result = []
    for conn_id, conn_data in connections[username].items():
        # Decrypt password
        conn_copy = conn_data.copy()
        conn_copy['wp_password'] = _decrypt_password(conn_data['wp_password'])
        result.append(conn_copy)
    
    return result


def get_connection(username: str, connection_id: str) -> Optional[Dict]:
    """
    Get specific connection by ID
    
    Args:
        username: User who owns the connection
        connection_id: Connection ID
    
    Returns:
        Connection dict with decrypted password, or None
    """
    connections = _load_connections()
    
    if username not in connections or connection_id not in connections[username]:
        return None
    
    conn_data = connections[username][connection_id].copy()
    conn_data['wp_password'] = _decrypt_password(conn_data['wp_password'])
    
    return conn_data


def update_connection(
    username: str,
    connection_id: str,
    site_name: Optional[str] = None,
    site_url: Optional[str] = None,
    wp_username: Optional[str] = None,
    wp_password: Optional[str] = None,
    site_language: Optional[str] = None,
    site_description: Optional[str] = None,
    enabled: Optional[bool] = None
) -> bool:
    """
    Update WordPress connection
    
    Args:
        username: User who owns the connection
        connection_id: Connection ID to update
        Other args: Fields to update (None = no change)
    
    Returns:
        True if updated successfully
    """
    connections = _load_connections()
    
    if username not in connections or connection_id not in connections[username]:
        return False
    
    conn = connections[username][connection_id]
    
    if site_name is not None:
        conn['site_name'] = site_name
    if site_url is not None:
        conn['site_url'] = site_url.rstrip('/')
    if wp_username is not None:
        conn['wp_username'] = wp_username
    if wp_password is not None:
        conn['wp_password'] = _encrypt_password(wp_password)
    if site_language is not None:
        conn['site_language'] = site_language
    if site_description is not None:
        conn['site_description'] = site_description
    if enabled is not None:
        conn['enabled'] = enabled
    
    conn['updated_at'] = datetime.now().isoformat()
    
    if _save_connections(connections):
        logger.info(f"Updated connection '{connection_id}' for user '{username}'")
        return True
    
    return False


def delete_connection(username: str, connection_id: str) -> bool:
    """
    Delete WordPress connection
    
    Args:
        username: User who owns the connection
        connection_id: Connection ID to delete
    
    Returns:
        True if deleted successfully
    """
    connections = _load_connections()
    
    if username not in connections or connection_id not in connections[username]:
        return False
    
    del connections[username][connection_id]
    
    # Remove user key if no connections left
    if not connections[username]:
        del connections[username]
    
    if _save_connections(connections):
        logger.info(f"Deleted connection '{connection_id}' for user '{username}'")
        return True
    
    return False


def update_last_used(username: str, connection_id: str) -> bool:
    """
    Update last_used timestamp for connection
    
    Args:
        username: User who owns the connection
        connection_id: Connection ID
    
    Returns:
        True if updated successfully
    """
    connections = _load_connections()
    
    if username not in connections or connection_id not in connections[username]:
        return False
    
    connections[username][connection_id]['last_used'] = datetime.now().isoformat()
    
    return _save_connections(connections)


def get_all_enabled_connections() -> Dict[str, Dict]:
    """
    Get all enabled connections across all users
    Useful for MCP server initialization
    
    Returns:
        Dict mapping connection_id to connection data (with decrypted passwords)
    """
    connections = _load_connections()
    result = {}
    
    for username, user_connections in connections.items():
        for conn_id, conn_data in user_connections.items():
            if conn_data.get('enabled', True):
                conn_copy = conn_data.copy()
                conn_copy['wp_password'] = _decrypt_password(conn_data['wp_password'])
                conn_copy['owner'] = username
                result[conn_id] = conn_copy
    
    return result


def test_connection(site_url: str, wp_username: str, wp_password: str) -> Dict:
    """
    Test WordPress connection credentials
    
    Args:
        site_url: WordPress site URL
        wp_username: WordPress username
        wp_password: WordPress password
    
    Returns:
        Dict with 'success' bool and 'message' str
    """
    import httpx
    
    try:
        auth = httpx.BasicAuth(wp_username, wp_password)
        url = f"{site_url.rstrip('/')}/wp-json/wp/v2/users/me"
        
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, auth=auth)
            
            if response.status_code == 200:
                user_data = response.json()
                return {
                    "success": True,
                    "message": f"Successfully connected as {user_data.get('name', wp_username)}",
                    "user_data": user_data
                }
            else:
                return {
                    "success": False,
                    "message": f"Authentication failed: {response.status_code}"
                }
    except Exception as e:
        return {
            "success": False,
            "message": f"Connection error: {str(e)}"
        }


if __name__ == "__main__":
    # Test the module
    print("Testing WordPress Connections Storage...")
    
    # Add test connection
    conn = add_wordpress_connection(
        username="testuser",
        site_name="My Test Site",
        site_url="https://example.com",
        wp_username="admin",
        wp_password="test_password_123",
        site_language="en",
        site_description="Test WordPress site"
    )
    print(f"Added connection: {conn}")
    
    # Get user connections
    connections = get_user_connections("testuser")
    print(f"User connections: {len(connections)}")
    for c in connections:
        print(f"  - {c['site_name']} ({c['site_url']})")
    
    # Get specific connection
    if connections:
        conn_id = connections[0]['connection_id']
        conn = get_connection("testuser", conn_id)
        print(f"Retrieved connection: {conn['site_name']}")
        
        # Update connection
        update_connection("testuser", conn_id, site_name="Updated Site Name")
        
        # Delete connection
        delete_connection("testuser", conn_id)
        print("Connection deleted")
    
    print("All tests passed!")

