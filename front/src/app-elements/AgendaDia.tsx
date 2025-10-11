import styles from './AgendaDia.module.less'
import notIcon from '../assets/not.png'
import type { AvailableTime, Scheduling } from '../model/scheduling'
import { dates } from '../fixtures/scheduling'

export function AgendaDia() {
  return (
    <div className={styles.agendaDia}>
      {dates.map((date: Scheduling, dateIdx: number) => (
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
  )
}