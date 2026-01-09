<script setup lang="ts">
    import { reactive, ref } from 'vue'
    import { createUser } from '../services/users_service'
    
    defineProps<{
      title: string
    }>()
    
    defineEmits<{
      navigateToLogin: []
    }>()
    
    type SignupForm = {
      firstName: string
      lastName: string
      email: string
      type: string
      city: string
      state: string
      zip: string
      country: string
      contact: string
      password: string
    }
    
    const form = reactive<SignupForm>({
      firstName: '',
      lastName: '',
      email: '',
      type: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      contact: '',
      password: ''
    })

    const userTypes = [
    { label: 'Admin', value: 1 },
    { label: 'Seller', value: 2 },
    { label: 'Buyer', value: 3 }
    ]

    const isLoading = ref(false)
    
    const onSignupClick = async () => {
      // Validation
      if (!form.email || !form.password) {
        alert('Email and password are required')
        return
      }
    
      if (!form.type) {
        alert('Please select a user type')
        return
      }

      if (!form.firstName || !form.lastName) {
        alert('First name and last name are required')
        return
      }

      isLoading.value = true

      try {
        const result = await createUser(form)
        
        if (result.error) {
          alert(`Error: ${result.error}`)
        } else {
          alert('User created successfully!')
          // Reset form after successful signup
          form.firstName = ''
          form.lastName = ''
          form.email = ''
          form.type = ''
          form.city = ''
          form.state = ''
          form.zip = ''
          form.country = ''
          form.contact = ''
          form.password = ''
        }
      } catch (error) {
        alert(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        isLoading.value = false
      }
    }
    </script>
    
    <template>
      <h1 class="page-title">{{ title }}</h1>
      <div class="signup">
        <form class="card" @submit.prevent="onSignupClick">
          <div class="row">
            <input v-model="form.firstName" placeholder="First Name" />
            <input v-model="form.lastName" placeholder="Last Name" />
          </div>
    
          <input v-model="form.email" type="email" placeholder="Email" />
          <!-- <input v-model="form.type" placeholder="User Type" /> -->
          <select v-model="form.type" :class="{ 'placeholder-selected': !form.type }">
            <option disabled value="">Select user type</option>
            <option
                v-for="type in userTypes"
                :key="type.value"
                :value="type.value"
            >
                {{ type.label }}
            </option>
            </select>

          <div class="row">
            <input v-model="form.city" placeholder="City" />
            <input v-model="form.state" placeholder="State" />
          </div>
    
          <div class="row">
            <input v-model="form.zip" placeholder="Zip" />
            <input v-model="form.country" placeholder="Country" />
          </div>
          <div class="row">
          <input
            v-model="form.contact"
            type="text"
            placeholder="Contact"
          />
          <input
            v-model="form.password"
            type="password"
            placeholder="Password"
          />
          </div>
    
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Signing Up...' : 'Sign Up' }}
          </button>
        </form>
      </div>
    </template>
    
    <style scoped>
    .page-title {
      margin: 0 0 30px 0;
      font-size: 28px;
      color: #333;
      text-align: center;
      font-weight: 600;
    }
    
    .signup {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    
    .card {
      width: 100%;
      max-width: 480px;
      padding: 32px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    
    .row {
      display: flex;
      gap: 10px;
    }
    
    input,
    select {
      flex: 1;
      padding: 14px 16px;
      border-radius: 6px;
      border: 1px solid #ddd;
      font-size: 15px;
      font-family: inherit;
      background-color: white;
      color: #333;
      width: 100%;
    }
    
    input::placeholder {
      color: #999;
    }
    
    input:focus,
    select:focus {
      outline: none;
      border-color: #42b983;
    }
    
    select {
      cursor: pointer;
      appearance: none;
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
    }
    
    /* Style select when placeholder option is selected */
    select.placeholder-selected {
      color: #999;
    }
    
    select option {
      color: #333;
      background-color: white;
    }
    
    select option:disabled {
      color: #999;
    }
    
    button {
      margin-top: 10px;
      padding: 14px;
      background: #42b983;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s;
    }
    
    button:hover:not(:disabled) {
      background: #369f72;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    </style>