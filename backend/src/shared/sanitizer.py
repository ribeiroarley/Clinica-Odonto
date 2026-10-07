import bleach
from typing import Optional


def sanitize_clinical_text(text: Optional[str]) -> Optional[str]:
    """
    Higienizacao estrita de campos de texto livre clinico (anamnese, observacoes, descricoes).
    Remove integralmente quaisquer tags HTML, payloads XSS, manipuladores de evento (onload, onclick)
    e caracteres perigosos, garantindo conformidade com a politica de AppSec e imutabilidade dos dados.
    """
    if text is None:
        return None
    # strip=True remove completamente as tags HTML em vez de apenas codifica-las
    cleaned: str = bleach.clean(text.strip(), tags=[], attributes={}, strip=True)
    return cleaned
