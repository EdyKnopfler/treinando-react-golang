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

  useEffect(() => {
    auth!.fetchAuthenticated(`/scheduling/${idAgenda}`).then((dates) => {
      setDates(dates as Array<Scheduling>)
    });
  }, [auth, idAgenda]);

  if (!dates) {
    return <p>Carregando...</p>
  }

  return (
    <>
      <h2>Agenda</h2>

      <div className={styles.agendaDia}>
        {(dates as Array<Scheduling>).map((date: Scheduling, dateIdx: number) => (
          <table key={dateIdx}>
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