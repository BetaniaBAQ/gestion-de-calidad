import { Button } from '@cualia/ui/components/button'
import {
  useSedeActiva,
  useSedes,
  useSetSedeActiva,
  useSetVistaCompleta,
  useVistaCompleta,
} from '#/lib/domain/config'

export function SedePills() {
  const sedes = useSedes()
  const sedeActiva = useSedeActiva()
  const vistaCompleta = useVistaCompleta()
  const setSedeActiva = useSetSedeActiva()
  const setVistaCompleta = useSetVistaCompleta()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant={vistaCompleta ? 'default' : 'outline'}
        onClick={() => setVistaCompleta(true)}
      >
        Todas
      </Button>
      {sedes
        .filter((s) => s.activa)
        .map((s) => {
          const active = !vistaCompleta && sedeActiva === s.codigo
          return (
            <Button
              key={s._id}
              size="sm"
              variant={active ? 'default' : 'outline'}
              onClick={() => {
                setVistaCompleta(false)
                setSedeActiva(s.codigo)
              }}
            >
              {s.ciudad}
            </Button>
          )
        })}
    </div>
  )
}
