
CREATE UNIQUE INDEX IF NOT EXISTS ux_contacts_email ON public.contacts(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_contacts_phone ON public.contacts(phone_e164) WHERE phone_e164 IS NOT NULL;
