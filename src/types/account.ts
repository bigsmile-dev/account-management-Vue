export interface Tag {
  text: string
}

export type RecordType = 'LDAP' | 'Локальная' | 'Local'

export interface Account {
  id: string
  tags: Tag[]
  recordType: RecordType
  login: string
  password: string | null
}

export interface ValidationErrors {
  login?: boolean
  password?: boolean
} 