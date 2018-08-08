export function dateString (time) {
  const monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'
  ]

  const date = new Date(time * 1000)

  const day = date.getDate()
  const monthIndex = date.getMonth()
  const year = date.getFullYear()

  return day + ' ' + monthNames[monthIndex] + ' ' + year
}

export function timeAgo (time) {
  const between = Date.now() / 1000 - Number(time)
  if (between < 3600) {
    return pluralize(~~(between / 60), ' minute') + ' ago'
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), ' hour') + ' ago'
  } else if (between < 2592000) {
    return pluralize(~~(between / 86400), ' day') + ' ago'
  } else {
    return dateString(time)
  }
}

function pluralize (time, label) {
  if (time === 1) {
    return time + label
  }
  return time + label + 's'
}

export function truncate (word) {
  const length = 6
  if (word.length <= length) {
    return word
  } else {
    return word.substring(0, length) + '...'
  }
}
