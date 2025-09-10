import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Account, Tag, RecordType } from '../types/account'

export const useAccountStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])

  // Load accounts from localStorage on store initialization
  const loadAccounts = () => {
    const saved = localStorage.getItem('accounts')
    if (saved) {
      try {
        accounts.value = JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load accounts from localStorage:', error)
      }
    }
  }

  // Save accounts to localStorage
  const saveAccounts = () => {
    localStorage.setItem('accounts', JSON.stringify(accounts.value))
  }

  // Create new empty account
  const createAccount = (): Account => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    tags: [],
    recordType: 'Локальная',
    login: '',
    password: ''
  })

  // Add new account
  const addAccount = () => {
    const newAccount = createAccount()
    accounts.value.push(newAccount)
    saveAccounts()
    return newAccount
  }

  // Remove account by id
  const removeAccount = (id: string) => {
    const index = accounts.value.findIndex(account => account.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
      saveAccounts()
    }
  }

  // Update account
  const updateAccount = (id: string, updates: Partial<Account>) => {
    const account = accounts.value.find(acc => acc.id === id)
    if (account) {
      Object.assign(account, updates)
      saveAccounts()
    }
  }

  // Parse tags from string
  const parseTagsFromString = (tagsString: string): Tag[] => {
    if (!tagsString.trim()) return []
    return tagsString
      .split(';')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => ({ text: tag }))
  }

  // Convert tags to string
  const tagsToString = (tags: Tag[]): string => {
    return tags.map(tag => tag.text).join('; ')
  }

  // Validate account
  const validateAccount = (account: Account): boolean => {
    if (!account.login.trim()) return false
    if (account.recordType === 'Локальная' && !account.password?.trim()) return false
    return true
  }

  // Computed
  const accountsCount = computed(() => accounts.value.length)

  // Initialize store
  loadAccounts()

  return {
    accounts,
    accountsCount,
    addAccount,
    removeAccount,
    updateAccount,
    parseTagsFromString,
    tagsToString,
    validateAccount,
    saveAccounts
  }
}) 