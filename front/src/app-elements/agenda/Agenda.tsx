import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styles from './Agenda.module.less'
import notIcon from '../../assets/not.png'
import type { AvailableTime, Scheduling } from '../../model/scheduling'
import { AuthContext } from '../../lib/auth/useAuth'

export function Agenda() {

  const auth = useContext(AuthContext);

  const { idAgenda } = useParams();

  const [dates, setDates] = useState<Array<Scheduling> | null>(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!auth) {
      return
    }

    let isCancelled = false;

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      setDates(null)
      try {
        const datesData = await auth.fetchAuthenticated<Array<Scheduling>>(`/scheduling/${idAgenda}`)
        if (!isCancelled) {
          setDates(datesData)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true;
    }
  }, [auth, idAgenda]);

  if (loading) {
    return <p>Carregando...</p>
  }

  if (error) {
    return <p>Ocorreu um erro ao carregar a agenda: {error.message}</p>
  }

  if (!dates) {
    return <p>Sem dados para exibir</p>
  }

  return (
    <>
      <h2>Agenda</h2>

      <div className={styles.agendaDia}>
        {dates.map((date) => (
          <table key={date.date}>
            <thead>
              <tr>
                <th></th>
                <th className={styles.date}>{date.date}</th>
              </tr>
            </thead>
            <tbody>
              {date.times.map((d: AvailableTime, i: number) => (
                <tr key={i}>
                  <td className={styles.time}>{d.time}</td>
                  <td className={styles.timeInfo + ' ' + (d.qty ? styles.available : styles.unavailable)}>
                    {d.qty ? `(${d.qty})` : <img className={styles.icon} src={notIcon} alt="Indisponível" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </>
  )
}