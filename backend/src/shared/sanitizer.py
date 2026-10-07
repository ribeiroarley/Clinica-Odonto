import re
import bleach
from typing import Optional


def sanitize_clinical_text(text: Optional[str]) -> Optional[str]:
    """
    Higienizacao estrita de campos de texto livre clinico (anamnese, observacoes, descricoes).
    Remove integralmente blocos <script> e <style>, payloads XSS, manipuladores de evento
    (onload, onerror, onclick) e tags HTML, garantindo conformidade com AppSec e LGPD.
    """
    if text is None:
        return None

    # Remove blocos completos de script e style incluindo o corpo do codigo
    sanitized = re.sub(r"<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>", "", text, flags=re.IGNORECASE)
    sanitized = re.sub(r"<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>", "", sanitized, flags=re.IGNORECASE)

    # strip=True remove completamente quaisquer tags e atributos residuais via bleach
    cleaned: str = bleach.clean(sanitized.strip(), tags=[], attributes={}, strip=True)
    return cleaned
