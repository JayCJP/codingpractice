const axios = require('axios')
export default function (url: string): string {
  return axios.get(url).then(res => res.data)
}
