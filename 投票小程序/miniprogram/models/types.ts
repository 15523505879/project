interface Contestant {
  _id: string
  openid: string
  name: string
  studentId: string
  photoUrl: string
  description: string
  voteCount: number
  createTime: Date
}

interface Vote {
  _id: string
  contestantId: string
  voterId: string
  createTime: Date
} 