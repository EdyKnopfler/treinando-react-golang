import styles from './AgendaDia.module.less'
import notIcon from '../assets/not.png'
import type { AvailableTime, Scheduling } from '../model/scheduling'

// TODO api
const dates: Array<Scheduling> = [
  { 
    date: '20/10/2025',
    times: [
      { time: '12:00', qty: 0 },
      { time: '13:00', qty: 3 },
      { time: '14:00', qty: 2 },
      { time: '15:00', qty: 0 },
      { time: '16:00', qty: 1 },
      { time: '17:00', qty: 0 },
    ],
  },
  { 
    date: '21/10/2025',
    times: [
      { time: '12:00', qty: 2 },
      { time: '13:00', qty: 1 },
      { time: '14:00', qty: 0 },
      { time: '15:00', qty: 0 },
      { time: '16:00', qty: 2 },
      { time: '17:00', qty: 3 },
    ],
  },
  { 
    date: '22/10/2025',
    times: [
      { time: '12:00', qty: 0 },
      { time: '13:00', qty: 3 },
      { time: '14:00', qty: 2 },
      { time: '15:00', qty: 0 },
      { time: '16:00', qty: 1 },
      { time: '17:00', qty: 0 },
    ],
  },
  { 
    date: '23/10/2025',
    times: [
      { time: '12:00', qty: 2 },
      { time: '13:00', qty: 1 },
      { time: '14:00', qty: 0 },
      { time: '15:00', qty: 0 },
      { time: '16:00', qty: 2 },
      { time: '17:00', qty: 3 },
    ],
  },
]

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