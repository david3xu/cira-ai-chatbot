CREATE OR REPLACE FUNCTION cleanup_stale_transactions()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER := 0;
BEGIN
    -- Mark transactions as cleaned
    UPDATE stale_transactions
    SET 
        cleaned_at = NOW(),
        status = 'cleaned'
    WHERE 
        cleaned_at IS NULL 
        AND created_at < NOW() - INTERVAL '1 hour';

    -- Get count of cleaned transactions
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;

    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql; 