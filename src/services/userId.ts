import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const characters = uuidv4().split('-').join('').toUpperCase()

export const generateId = (length: any) => {
  let id = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    id += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return id
}
