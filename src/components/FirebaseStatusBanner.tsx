import { missingFirebaseEnvVars } from '../firebase/config';

export function FirebaseStatusBanner() {
  if (missingFirebaseEnvVars.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Firebase no está configurado.</p>
      <p className="mt-1">
        Faltan variables de entorno y no se podrá leer ni guardar en Firestore.
      </p>
      <p className="mt-2 font-mono text-xs">
        {missingFirebaseEnvVars.join(', ')}
      </p>
    </div>
  );
}
