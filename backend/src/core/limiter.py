from slowapi import Limiter
from slowapi.util import get_remote_address

# Limitador de taxa global baseado no IP de origem
limiter = Limiter(key_func=get_remote_address)
