CREATE OR REPLACE FUNCTION OWNER_ODONTO.FN_VALIDA_CPF (p_cpf IN VARCHAR2) RETURN BOOLEAN IS
    v_cpf VARCHAR2(11);
    v_soma NUMBER := 0;
    v_resto NUMBER;
    v_digito1 NUMBER;
    v_digito2 NUMBER;
BEGIN
    -- Remove caracteres especiais
    v_cpf := REGEXP_REPLACE(p_cpf, '[^0-9]', '');

    -- Verifica tamanho
    IF LENGTH(v_cpf) != 11 THEN
        RETURN FALSE;
    END IF;

    -- Verifica se todos os digitos sao iguais (ex: 11111111111)
    IF v_cpf IN ('00000000000', '11111111111', '22222222222', '33333333333', 
                 '44444444444', '55555555555', '66666666666', '77777777777', 
                 '88888888888', '99999999999') THEN
        RETURN FALSE;
    END IF;

    -- Validacao do primeiro digito
    FOR i IN 1..9 LOOP
        v_soma := v_soma + TO_NUMBER(SUBSTR(v_cpf, i, 1)) * (11 - i);
    END LOOP;
    v_resto := MOD(v_soma, 11);
    IF v_resto < 2 THEN
        v_digito1 := 0;
    ELSE
        v_digito1 := 11 - v_resto;
    END IF;

    IF TO_NUMBER(SUBSTR(v_cpf, 10, 1)) != v_digito1 THEN
        RETURN FALSE;
    END IF;

    -- Validacao do segundo digito
    v_soma := 0;
    FOR i IN 1..10 LOOP
        v_soma := v_soma + TO_NUMBER(SUBSTR(v_cpf, i, 1)) * (12 - i);
    END LOOP;
    v_resto := MOD(v_soma, 11);
    IF v_resto < 2 THEN
        v_digito2 := 0;
    ELSE
        v_digito2 := 11 - v_resto;
    END IF;

    IF TO_NUMBER(SUBSTR(v_cpf, 11, 1)) != v_digito2 THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END FN_VALIDA_CPF;
/
