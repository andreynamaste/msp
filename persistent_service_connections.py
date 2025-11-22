#!/usr/bin/env python3
"""
Persistent storage for user service connections (Kie.ai, Wordstat, Telegram Bot, etc.)
Stores API keys and credentials for various services
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
CONNECTIONS_FILE = Path(__file__).parent / "data" / "service_connections.json"
CONNECTIONS_FILE.parent.mkdir(parents=True, exist_ok=True)

# Encryption key (shared with WordPress connections)
ENCRYPTION_KEY = os.environ.get("WP_ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    key_file = Path(__file__).parent / "data" / ".wp_key"
    if key_file.exists():
        ENCRYPTION_KEY = key_file.read_text().strip()
    else:
        ENCRYPTION_KEY = Fernet.generate_key().decode()
        key_file.write_text(ENCRYPTION_KEY)
        key_file.chmod(0o600)

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


def _encrypt(value: str) -> str:
    """Encrypt value"""
    if not value:
        return ""
    return cipher_suite.encrypt(value.encode()).decode()


def _decrypt(encrypted: str) -> str:
    """Decrypt value"""
    if not encrypted:
        return ""
    return cipher_suite.decrypt(encrypted.encode()).decode()


# ============================================
# Kie.ai Connections
# ============================================

def add_kie_connection(
    username: str,
    connection_name: str,
    api_key: str,
    description: str = ""
) -> Dict:
    """Add Kie.ai connection"""
    connections = _load_connections()
    
    if username not in connections:
        connections[username] = {"kie": {}, "wordstat": {}, "telegram": {}}
    if "kie" not in connections[username]:
        connections[username]["kie"] = {}
    
    connection_id = f"{username}_kie_{len(connections[username]['kie']) + 1}"
    
    connections[username]["kie"][connection_id] = {
        "connection_id": connection_id,
        "connection_name": connection_name,
        "api_key": _encrypt(api_key),
        "description": description,
        "created_at": datetime.now().isoformat(),
        "enabled": True,
        "last_used": None
    }
    
    if _save_connections(connections):
        logger.info(f"Added Kie.ai connection '{connection_id}' for user '{username}'")
        return connections[username]["kie"][connection_id]
    return None


def get_kie_connections(username: str) -> List[Dict]:
    """Get all Kie.ai connections for user"""
    connections = _load_connections()
    
    if username not in connections or "kie" not in connections[username]:
        return []
    
    result = []
    for conn_id, conn_data in connections[username]["kie"].items():
        conn_copy = conn_data.copy()
        conn_copy['api_key'] = _decrypt(conn_data['api_key'])
        result.append(conn_copy)
    
    return result


def update_kie_connection(
    username: str,
    connection_id: str,
    connection_name: Optional[str] = None,
    api_key: Optional[str] = None,
    description: Optional[str] = None,
    enabled: Optional[bool] = None
) -> bool:
    """Update Kie.ai connection"""
    connections = _load_connections()
    
    if username not in connections or "kie" not in connections[username] or connection_id not in connections[username]["kie"]:
        return False
    
    conn = connections[username]["kie"][connection_id]
    
    if connection_name is not None:
        conn['connection_name'] = connection_name
    if api_key is not None:
        conn['api_key'] = _encrypt(api_key)
    if description is not None:
        conn['description'] = description
    if enabled is not None:
        conn['enabled'] = enabled
    
    conn['updated_at'] = datetime.now().isoformat()
    
    return _save_connections(connections)


def delete_kie_connection(username: str, connection_id: str) -> bool:
    """Delete Kie.ai connection"""
    connections = _load_connections()
    
    if username not in connections or "kie" not in connections[username] or connection_id not in connections[username]["kie"]:
        return False
    
    del connections[username]["kie"][connection_id]
    return _save_connections(connections)


# ============================================
# Wordstat Connections
# ============================================

def add_wordstat_connection(
    username: str,
    connection_name: str,
    client_id: str,
    client_secret: str,
    redirect_uri: str,
    description: str = ""
) -> Dict:
    """Add Wordstat connection"""
    connections = _load_connections()
    
    if username not in connections:
        connections[username] = {"kie": {}, "wordstat": {}, "telegram": {}}
    if "wordstat" not in connections[username]:
        connections[username]["wordstat"] = {}
    
    connection_id = f"{username}_wordstat_{len(connections[username]['wordstat']) + 1}"
    
    connections[username]["wordstat"][connection_id] = {
        "connection_id": connection_id,
        "connection_name": connection_name,
        "client_id": client_id,
        "client_secret": _encrypt(client_secret),
        "redirect_uri": redirect_uri,
        "description": description,
        "created_at": datetime.now().isoformat(),
        "enabled": True,
        "last_used": None
    }
    
    if _save_connections(connections):
        logger.info(f"Added Wordstat connection '{connection_id}' for user '{username}'")
        return connections[username]["wordstat"][connection_id]
    return None


def get_wordstat_connections(username: str) -> List[Dict]:
    """Get all Wordstat connections for user"""
    connections = _load_connections()
    
    if username not in connections or "wordstat" not in connections[username]:
        return []
    
    result = []
    for conn_id, conn_data in connections[username]["wordstat"].items():
        conn_copy = conn_data.copy()
        conn_copy['client_secret'] = _decrypt(conn_data['client_secret'])
        result.append(conn_copy)
    
    return result


def update_wordstat_connection(
    username: str,
    connection_id: str,
    connection_name: Optional[str] = None,
    client_id: Optional[str] = None,
    client_secret: Optional[str] = None,
    redirect_uri: Optional[str] = None,
    description: Optional[str] = None,
    enabled: Optional[bool] = None
) -> bool:
    """Update Wordstat connection"""
    connections = _load_connections()
    
    if username not in connections or "wordstat" not in connections[username] or connection_id not in connections[username]["wordstat"]:
        return False
    
    conn = connections[username]["wordstat"][connection_id]
    
    if connection_name is not None:
        conn['connection_name'] = connection_name
    if client_id is not None:
        conn['client_id'] = client_id
    if client_secret is not None:
        conn['client_secret'] = _encrypt(client_secret)
    if redirect_uri is not None:
        conn['redirect_uri'] = redirect_uri
    if description is not None:
        conn['description'] = description
    if enabled is not None:
        conn['enabled'] = enabled
    
    conn['updated_at'] = datetime.now().isoformat()
    
    return _save_connections(connections)


def delete_wordstat_connection(username: str, connection_id: str) -> bool:
    """Delete Wordstat connection"""
    connections = _load_connections()
    
    if username not in connections or "wordstat" not in connections[username] or connection_id not in connections[username]["wordstat"]:
        return False
    
    del connections[username]["wordstat"][connection_id]
    return _save_connections(connections)


# ============================================
# Telegram Bot Connections
# ============================================

def add_telegram_connection(
    username: str,
    bot_name: str,
    bot_token: str,
    chat_id: str,
    description: str = ""
) -> Dict:
    """Add Telegram bot connection"""
    connections = _load_connections()
    
    if username not in connections:
        connections[username] = {"kie": {}, "wordstat": {}, "telegram": {}}
    if "telegram" not in connections[username]:
        connections[username]["telegram"] = {}
    
    connection_id = f"{username}_telegram_{len(connections[username]['telegram']) + 1}"
    
    connections[username]["telegram"][connection_id] = {
        "connection_id": connection_id,
        "bot_name": bot_name,
        "bot_token": _encrypt(bot_token),
        "chat_id": chat_id,
        "description": description,
        "created_at": datetime.now().isoformat(),
        "enabled": True,
        "last_used": None
    }
    
    if _save_connections(connections):
        logger.info(f"Added Telegram connection '{connection_id}' for user '{username}'")
        return connections[username]["telegram"][connection_id]
    return None


def get_telegram_connections(username: str) -> List[Dict]:
    """Get all Telegram connections for user"""
    connections = _load_connections()
    
    if username not in connections or "telegram" not in connections[username]:
        return []
    
    result = []
    for conn_id, conn_data in connections[username]["telegram"].items():
        conn_copy = conn_data.copy()
        conn_copy['bot_token'] = _decrypt(conn_data['bot_token'])
        result.append(conn_copy)
    
    return result


def update_telegram_connection(
    username: str,
    connection_id: str,
    bot_name: Optional[str] = None,
    bot_token: Optional[str] = None,
    chat_id: Optional[str] = None,
    description: Optional[str] = None,
    enabled: Optional[bool] = None
) -> bool:
    """Update Telegram connection"""
    connections = _load_connections()
    
    if username not in connections or "telegram" not in connections[username] or connection_id not in connections[username]["telegram"]:
        return False
    
    conn = connections[username]["telegram"][connection_id]
    
    if bot_name is not None:
        conn['bot_name'] = bot_name
    if bot_token is not None:
        conn['bot_token'] = _encrypt(bot_token)
    if chat_id is not None:
        conn['chat_id'] = chat_id
    if description is not None:
        conn['description'] = description
    if enabled is not None:
        conn['enabled'] = enabled
    
    conn['updated_at'] = datetime.now().isoformat()
    
    return _save_connections(connections)


def delete_telegram_connection(username: str, connection_id: str) -> bool:
    """Delete Telegram connection"""
    connections = _load_connections()
    
    if username not in connections or "telegram" not in connections[username] or connection_id not in connections[username]["telegram"]:
        return False
    
    del connections[username]["telegram"][connection_id]
    return _save_connections(connections)


if __name__ == "__main__":
    print("Testing Service Connections Storage...")
    
    # Test Kie.ai
    conn = add_kie_connection("testuser", "My Kie.ai", "test_api_key_123", "Test connection")
    print(f"✅ Kie.ai connection added: {conn['connection_id']}")
    
    # Test Wordstat
    conn = add_wordstat_connection("testuser", "My Wordstat", "client123", "secret456", "https://redirect.uri", "Test")
    print(f"✅ Wordstat connection added: {conn['connection_id']}")
    
    # Test Telegram
    conn = add_telegram_connection("testuser", "My Bot", "bot_token_789", "-1003056881771", "Test bot")
    print(f"✅ Telegram connection added: {conn['connection_id']}")
    
    print("\n✅ All tests passed!")

