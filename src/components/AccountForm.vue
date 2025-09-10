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
        <div class="table-header">
          <div class="header-cell col-3">
            <q-icon name="label" size="sm" class="q-mr-xs" />
            Метки
          </div>
          <div class="header-cell col-2">
            <q-icon name="category" size="sm" class="q-mr-xs" />
            Тип записи
          </div>
          <div class="header-cell col-3">
            <q-icon name="person" size="sm" class="q-mr-xs" />
            Логин
          </div>
          <div class="header-cell col-3">
            <q-icon name="lock" size="sm" class="q-mr-xs" />
            Пароль
          </div>
          <div class="header-cell col-1">
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
            <q-card-section class="account-row">
              <!-- Tags field -->
              <div class="field-container col-3">
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
              <div class="field-container col-2">
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
              <div class="field-container col-3">
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

              <!-- Password field -->
              <div class="field-container col-3">
                <q-input
                  v-if="account.recordType === 'Локальная'"
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
                <div v-else class="password-disabled">
                  <q-icon name="lock" color="grey-4" class="q-mr-sm" />
                  <span class="text-grey-5">LDAP аутентификация</span>
                </div>
              </div>

              <!-- Delete button -->
              <div class="field-container col-1 text-right">
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
const recordTypeOptions: { label: string; value: RecordType }[] = [
  { label: 'Локальная', value: 'Локальная' },
  { label: 'LDAP', value: 'LDAP' }
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
  const updates: any = { recordType }
  if (recordType === 'LDAP') {
    updates.password = null
  } else if (recordType === 'Локальная') {
    updates.password = ''
  }
  accountStore.updateAccount(id, updates)
  validateAccount(id)
}

// Update account login
const updateAccountLogin = (id: string) => {
  validateAccount(id)
}

// Update account password
const updateAccountPassword = (id: string) => {
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
  if (account.recordType === 'Локальная' && !account.password?.trim()) {
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

onMounted(() => {
  initializeTagsInputs()
})
</script>

<style scoped>
.account-form {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.title-section {
  display: flex;
  align-items: center;
}

.form-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  margin: 0.5rem 0 0 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.add-account-btn {
  min-width: 60px;
  min-height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.add-account-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.info-banner {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(52, 152, 219, 0.3);
  margin-top: 1rem;
  backdrop-filter: blur(10px);
}

.info-text {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Content Section */
.content-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.table-header {
  display: flex;
  padding: 1rem 0;
  border-bottom: 2px solid #ecf0f1;
  margin-bottom: 1rem;
}

.header-cell {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
  padding: 0 0.5rem;
}

/* Account Cards */
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-card {
  border-radius: 15px;
  border: 1px solid #e8f4f8;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9));
  transition: all 0.3s ease;
  overflow: hidden;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3498db;
}

.account-row {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 1rem;
}

.field-container {
  padding: 0 0.5rem;
}

/* Modern Inputs */
.modern-input :deep(.q-field__control) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #e8f4f8;
  transition: all 0.3s ease;
}

.modern-input :deep(.q-field__control):hover {
  border-color: #3498db;
  background: rgba(255, 255, 255, 0.95);
}

.modern-input :deep(.q-field--focused .q-field__control) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-select :deep(.q-field__control) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #e8f4f8;
  transition: all 0.3s ease;
}

.modern-select :deep(.q-field__control):hover {
  border-color: #3498db;
  background: rgba(255, 255, 255, 0.95);
}

.modern-select :deep(.q-field--focused .q-field__control) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  border-radius: 12px;
  border: 2px solid #ecf0f1;
}

/* Delete Button */
.delete-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.5);
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