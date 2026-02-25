# Supabase Edge Functions

## invite-user

Admin kullanıcıların yeni kullanıcı davet etmesi için kullanılır.

### Deploy

```bash
supabase functions deploy invite-user
```

### Gerekli Ortam Değişkenleri

- `SUPABASE_URL` - Otomatik ayarlanır
- `SUPABASE_ANON_KEY` - Otomatik ayarlanır  
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase Dashboard → Settings → API içinden alınır

### Kullanım

Admin panel → Kullanıcı Yönetimi → "Kullanıcı Davet Et" butonu.

Davet edilen kullanıcı e-posta ile aktivasyon linki alır.
