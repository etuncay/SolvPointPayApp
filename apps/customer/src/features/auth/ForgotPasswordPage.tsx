import { useState } from 'react';
import { Link } from 'react-router-dom';
import { customerPortalApi } from '@epay/data';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { AlertBanner } from '@/components/ui/AlertBanner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await customerPortalApi.requestPasswordReset(email);
    setSent(true);
  }

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="container" style={{ maxWidth: 420 }}>
        <div className="card card-pad">
          <h1 className="page-title" style={{ fontSize: 22, marginBottom: 12 }}>
            Parolamı Unuttum
          </h1>
          {sent ? (
            <AlertBanner tone="info" icon="shield">
              E-posta adresi sistemde kayıtlıysa sıfırlama linki gönderildi. (2 saat geçerli, tek
              kullanımlık)
            </AlertBanner>
          ) : (
            <form onSubmit={onSubmit}>
              <Field label="E-posta" required>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Button type="submit" variant="primary" block style={{ marginTop: 16 }}>
                Gönder
              </Button>
            </form>
          )}
          <p style={{ marginTop: 16 }}>
            <Link to="/login">Girişe dön</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
