import { FormEvent, useState } from 'react';
import { FirebaseStatusBanner } from '../../components/FirebaseStatusBanner';
import { usePlayerActions } from './hooks/usePlayerActions';
import { usePlayers } from './hooks/usePlayers';

export function PlayersPage() {
  const { players, isLoading, error } = usePlayers();
  const actions = usePlayerActions();
  const [newName, setNewName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  async function handleCreatePlayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const wasSuccessful = await actions.create(newName);

    if (wasSuccessful) {
      setNewName('');
    }
  }

  async function handleUpdatePlayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPlayerId) {
      return;
    }

    const wasSuccessful = await actions.update(editingPlayerId, editingName);

    if (wasSuccessful) {
      setEditingPlayerId(null);
      setEditingName('');
    }
  }

  async function handleDeletePlayer(playerId: string) {
    await actions.remove(playerId);
  }

  return (
    <section className="space-y-6">
      <FirebaseStatusBanner />

      <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Jugadores globales
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">
          Crear y gestionar jugadores
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Los jugadores quedan disponibles para futuras partidas y para las
          estadísticas globales.
        </p>

        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={handleCreatePlayer}
        >
          <input
            value={newName}
            onChange={(event) => {
              actions.clearError();
              setNewName(event.target.value);
            }}
            placeholder="Nombre del jugador"
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-blueTeam"
          />
          <button
            type="submit"
            disabled={actions.isSubmitting}
            className="rounded-2xl bg-blueTeam px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actions.isSubmitting ? 'Guardando...' : 'Crear jugador'}
          </button>
        </form>

        {actions.error ? (
          <p className="mt-3 text-sm font-medium text-red-700">{actions.error}</p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </article>

      <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Lista actual
            </p>
            <h3 className="mt-2 text-xl font-black tracking-tight">
              {players.length} jugador{players.length === 1 ? '' : 'es'}
            </h3>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-slate-600">Cargando jugadores...</p>
        ) : null}

        {!isLoading && players.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            Aún no hay jugadores creados.
          </p>
        ) : null}

        <div className="mt-4 grid gap-3">
          {players.map((player) => {
            const isEditing = editingPlayerId === player.id;

            return (
              <article
                key={player.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                {isEditing ? (
                  <form
                    className="flex flex-col gap-3 sm:flex-row sm:items-center"
                    onSubmit={handleUpdatePlayer}
                  >
                    <input
                      value={editingName}
                      onChange={(event) => {
                        actions.clearError();
                        setEditingName(event.target.value);
                      }}
                      className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blueTeam"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={actions.isSubmitting}
                        className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlayerId(null);
                          setEditingName('');
                        }}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-bold text-ink">{player.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlayerId(player.id);
                          setEditingName(player.name);
                          actions.clearError();
                        }}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void handleDeletePlayer(player.id);
                        }}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
