<template>
  <div class="account-form">
    <div class="form-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="account_circle" size="2rem" color="primary" class="q-mr-md" />
            <div>
              <h4 class="form-title">Учетные записи</h4>
              <p class="form-subtitle">Управление пользователями системы</p>
            </div>
          </div>
          <q-btn
            round
            color="primary"
            icon="add"
            size="lg"
            @click="addNewAccount"
            class="add-account-btn"
            unelevated
          >
            <q-tooltip>Добавить новую учетную запись</q-tooltip>
          </q-btn>
        </div>

        <!-- Info Banner -->
        <q-banner class="info-banner" rounded>
          <template v-slot:avatar>
            <q-icon name="info" color="info" />
          </template>
          <span class="info-text">
            Для указания нескольких меток для одной пары логин/пароль используйте разделитель <strong>;</strong>
          </span>
        </q-banner>
      </div>

      <!-- Main Content -->
      <div class="content-section">
        <!-- Headers -->
        <div class="table-header-grid">
          <div class="header-tags">
            <q-icon name="label" size="sm" class="q-mr-xs" />
            Метки
          </div>
          <div class="header-type">
            <q-icon name="category" size="sm" class="q-mr-xs" />
            Тип записи
          </div>
          <div class="header-login">
            <q-icon name="person" size="sm" class="q-mr-xs" />
            Логин
          </div>
          <div class="header-password">
            <q-icon name="lock" size="sm" class="q-mr-xs" />
            Пароль
          </div>
          <div class="header-delete">
            <q-icon name="settings" size="sm" />
          </div>
        </div>

        <!-- Account rows -->
        <div class="accounts-list">
          <q-card
            v-for="account in accountStore.accounts"
            :key="account.id"
            class="account-card"
            flat
            bordered
          >
            <q-card-section class="account-row-grid" :class="account.recordType === 'LDAP' ? 'ldap-layout' : 'local-layout'">
              <!-- Tags field -->
              <div class="grid-tags">
                <q-input
                  v-model="tagsInputs[account.id]"
                  outlined
                  dense
                  placeholder="Введите метки через ;"
                  maxlength="50"
                  :error="validationErrors[account.id]?.tags"
                  @blur="updateAccountTags(account.id)"
                  @keyup.enter="updateAccountTags(account.id)"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="label" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <!-- Record type select -->
              <div class="grid-type">
                <q-select
                  v-model="account.recordType"
                  :options="recordTypeOptions"
                  outlined
                  dense
                  @update:model-value="updateAccountRecordType(account.id, $event)"
                  class="modern-select"
                >
                  <template v-slot:prepend>
                    <q-icon name="category" color="grey-6" />
                  </template>
                </q-select>
              </div>

              <!-- Login field -->
              <div class="grid-login">
                <q-input
                  v-model="account.login"
                  outlined
                  dense
                  placeholder="Введите логин"
                  maxlength="100"
                  :error="validationErrors[account.id]?.login"
                  @blur="updateAccountLogin(account.id)"
                  @keyup.enter="updateAccountLogin(account.id)"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <!-- Password field - only shown when Local -->
              <div v-if="account.recordType === 'Локальная' || account.recordType === 'Local'" class="grid-password">
                <q-input
                  :key="`password-${account.id}-${account.recordType}`"
                  v-model="account.password"
                  :type="showPasswords[account.id] ? 'text' : 'password'"
                  outlined
                  dense
                  placeholder="Введите пароль"
                  maxlength="100"
                  :error="validationErrors[account.id]?.password"
                  @blur="updateAccountPassword(account.id)"
                  @keyup.enter="updateAccountPassword(account.id)"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="grey-6" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showPasswords[account.id] ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-6"
                      @click="togglePasswordVisibility(account.id)"
                    />
                  </template>
                </q-input>
              </div>

              <!-- Delete button -->
              <div class="grid-delete">
                <q-btn
                  round
                  color="negative"
                  icon="delete"
                  size="md"
                  @click="removeAccount(account.id)"
                  class="delete-btn"
                  unelevated
                >
                  <q-tooltip>Удалить учетную запись</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Empty state -->
        <div v-if="accountStore.accounts.length === 0" class="empty-state">
          <div class="empty-content">
            <q-icon name="account_circle" size="5rem" color="grey-4" class="q-mb-md" />
            <h6 class="empty-title">Нет учетных записей</h6>
            <p class="empty-subtitle">Создайте первую учетную запись, нажав кнопку "+" выше</p>
            <q-btn
              color="primary"
              icon="add"
              label="Добавить запись"
              @click="addNewAccount"
              unelevated
              rounded
              class="q-mt-md"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useAccountStore } from '../stores/accountStore'
import type { RecordType, ValidationErrors } from '../types/account'

const accountStore = useAccountStore()

// Reactive data
const tagsInputs = ref<Record<string, string>>({})
const validationErrors = ref<Record<string, ValidationErrors>>({})
const showPasswords = ref<Record<string, boolean>>({})

// Record type options
const recordTypeOptions: RecordType[] = [
  'Локальная',
  'LDAP'
]

// Initialize tags inputs for existing accounts
const initializeTagsInputs = () => {
  accountStore.accounts.forEach(account => {
    if (!tagsInputs.value[account.id]) {
      tagsInputs.value[account.id] = accountStore.tagsToString(account.tags)
    }
    if (!validationErrors.value[account.id]) {
      validationErrors.value[account.id] = {}
    }
    if (!showPasswords.value[account.id]) {
      showPasswords.value[account.id] = false
    }
  })
}

// Add new account
const addNewAccount = () => {
  const newAccount = accountStore.addAccount()
  tagsInputs.value[newAccount.id] = ''
  validationErrors.value[newAccount.id] = {}
  showPasswords.value[newAccount.id] = false
}

// Remove account
const removeAccount = (id: string) => {
  accountStore.removeAccount(id)
  delete tagsInputs.value[id]
  delete validationErrors.value[id]
  delete showPasswords.value[id]
}

// Update account tags
const updateAccountTags = (id: string) => {
  const tagsString = tagsInputs.value[id] || ''
  const tags = accountStore.parseTagsFromString(tagsString)
  accountStore.updateAccount(id, { tags })
  validateAccount(id)
}

// Update account record type
const updateAccountRecordType = (id: string, recordType: RecordType) => {
  const account = accountStore.accounts.find(acc => acc.id === id)
  if (!account) return

  const updates: any = { recordType }
  if (recordType === 'LDAP') {
    updates.password = null
  } else if (recordType === 'Локальная' || recordType === 'Local') {
    // Ensure password is initialized as empty string for local accounts
    updates.password = account.password === null ? '' : account.password
  }
  
  accountStore.updateAccount(id, updates)
  
  // Force reactivity update by clearing and resetting validation errors
  if (validationErrors.value[id]) {
    validationErrors.value[id] = { ...validationErrors.value[id] }
  }
  
  validateAccount(id)
}

// Update account login
const updateAccountLogin = (id: string) => {
  const account = accountStore.accounts.find(acc => acc.id === id)
  if (account) {
    // Save the current login value to the store
    accountStore.updateAccount(id, { login: account.login })
  }
  validateAccount(id)
}

// Update account password
const updateAccountPassword = (id: string) => {
  const account = accountStore.accounts.find(acc => acc.id === id)
  if (account) {
    // Save the current password value to the store
    accountStore.updateAccount(id, { password: account.password })
  }
  validateAccount(id)
}

// Toggle password visibility
const togglePasswordVisibility = (id: string) => {
  showPasswords.value[id] = !showPasswords.value[id]
}

// Validate account
const validateAccount = (id: string) => {
  const account = accountStore.accounts.find(acc => acc.id === id)
  if (!account) return

  const errors: ValidationErrors = {}
  
  // Validate login
  if (!account.login.trim()) {
    errors.login = true
  }

  // Validate password for local accounts
  if ((account.recordType === 'Локальная' || account.recordType === 'Local') && !account.password?.trim()) {
    errors.password = true
  }

  validationErrors.value[id] = errors
}

// Watch for changes in accounts to initialize inputs
watch(
  () => accountStore.accounts,
  () => {
    initializeTagsInputs()
  },
  { deep: true, immediate: true }
)

// Watch for deep changes in accounts data and auto-save
watch(
  () => accountStore.accounts,
  () => {
    // Auto-save whenever account data changes
    accountStore.saveAccounts()
  },
  { deep: true, flush: 'post' }
)

onMounted(() => {
  initializeTagsInputs()
})
</script>

<style scoped>
.account-form {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
}

.form-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Section */
.header-section {
  margin-bottom: 2rem;
}

.header-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.title-section {
  display: flex;
  align-items: center;
}

.form-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
}

.form-subtitle {
  margin: 0.5rem 0 0 0;
  color: #64748b;
  font-size: 1rem;
}

.add-account-btn {
  min-width: 60px;
  min-height: 60px;
  background: #3b82f6;
  border: none;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
}

.add-account-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.info-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  margin-top: 1rem;
}

.info-text {
  color: #1e40af;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Content Section */
.content-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

/* Header Grid - matches data row grid exactly */
.table-header-grid {
  display: grid;
  grid-template-columns: 3fr 2fr 3fr 3fr 1fr;
  grid-template-areas: "tags type login password delete";
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #f1f5f9;
  margin-bottom: 1rem;
  gap: 1rem;
}

.header-tags { 
  grid-area: tags;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.header-type { 
  grid-area: type;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.header-login { 
  grid-area: login;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.header-password { 
  grid-area: password;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.header-delete { 
  grid-area: delete;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

/* Account Cards */
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-card {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  transition: all 0.3s ease;
  overflow: hidden;
}

.account-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

/* CSS Grid Layout - INNOVATIVE APPROACH */
.account-row-grid {
  display: grid;
  align-items: center;
  padding: 1.5rem;
  gap: 1rem;
}

/* Local layout: 5 columns (tags, type, login, password, delete) */
.local-layout {
  grid-template-columns: 3fr 2fr 3fr 3fr 1fr;
  grid-template-areas: "tags type login password delete";
}

/* LDAP layout: 4 columns (tags, type, login-expanded, delete) */
.ldap-layout {
  grid-template-columns: 3fr 2fr 6fr 1fr;
  grid-template-areas: "tags type login delete";
}

.grid-tags { grid-area: tags; }
.grid-type { grid-area: type; }
.grid-login { grid-area: login; }
.grid-password { grid-area: password; }
.grid-delete { 
  grid-area: delete; 
  display: flex;
  justify-content: center;
}

/* Modern Inputs - Fixed height and positioning */
.modern-input :deep(.q-field__control) {
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
  min-height: 40px;
  height: 40px;
}

.modern-input :deep(.q-field__control):hover {
  border-color: #9ca3af;
  background: #ffffff;
}

.modern-input :deep(.q-field--focused .q-field__control) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Error state - only change border color, maintain size */
.modern-input :deep(.q-field--error .q-field__control) {
  border-color: #ef4444 !important;
  min-height: 40px !important;
  height: 40px !important;
}

/* Hide error messages to prevent layout shift */
.modern-input :deep(.q-field__messages) {
  display: none;
}

.modern-select :deep(.q-field__control) {
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
  min-height: 40px;
  height: 40px;
}

.modern-select :deep(.q-field__control):hover {
  border-color: #9ca3af;
  background: #ffffff;
}

.modern-select :deep(.q-field--focused .q-field__control) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Error state for select - only change border color, maintain size */
.modern-select :deep(.q-field--error .q-field__control) {
  border-color: #ef4444 !important;
  min-height: 40px !important;
  height: 40px !important;
}

/* Hide error messages to prevent layout shift */
.modern-select :deep(.q-field__messages) {
  display: none;
}

/* Error States */
.q-field--error :deep(.q-field__control) {
  border-color: #e74c3c !important;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
}

/* Password Disabled State */
.password-disabled {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(149, 165, 166, 0.1);
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* Delete Button */
.delete-btn {
  background: #ef4444;
  border: none;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 3rem;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-title {
  margin: 1rem 0 0.5rem 0;
  color: #2c3e50;
  font-weight: 600;
}

.empty-subtitle {
  margin: 0 0 1rem 0;
  color: #7f8c8d;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .account-row {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .field-container {
    min-width: 200px;
    flex: 1;
  }
  
  .field-container.col-1 {
    flex: none;
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .account-form {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .table-header {
    display: none;
  }
  
  .account-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .field-container {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .field-container.col-1 {
    text-align: center;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.account-card {
  animation: slideIn 0.3s ease-out;
}

/* Tooltips */
.q-tooltip {
  background: rgba(44, 62, 80, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  font-size: 0.85rem;
}
</style> 