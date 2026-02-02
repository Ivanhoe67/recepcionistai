-- =====================================================
-- Add whatsapp_phone column to businesses table
-- =====================================================

-- Add the new column
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_whatsapp_phone 
ON public.businesses(whatsapp_phone);

-- Update comment
COMMENT ON COLUMN public.businesses.whatsapp_phone IS 'WhatsApp phone number for this business (for messaging agent)';
COMMENT ON COLUMN public.businesses.phone IS 'Retell phone number for voice calls';

SELECT 'WhatsApp phone column added successfully!' as status;
