
<script setup>
import { ref } from 'vue';
import api from '../api.js';
import '../style.css';

// Evento para notificar que el inicio de sesión fue exitoso
const emit = defineEmits(['login-success']);

// Datos del formulario
const loginForm = ref({
  identifier: '',
  password: ''
});

// Estados del componente
const errorMsg = ref('');
const loading = ref(false);
const showPassword = ref(false);

// Iniciar sesión
const iniciarSesion = async () => {
  errorMsg.value = '';

  // Validar campos
  if (!loginForm.value.identifier.trim()) {
    errorMsg.value = 'Ingresa tu correo electrónico o usuario';
    return;
  }

  if (!loginForm.value.password) {
    errorMsg.value = 'Ingresa tu contraseña';
    return;
  }

  try {
    loading.value = true;

    // Datos que espera auth.controller.js
    const payload = {
      identifier: loginForm.value.identifier.trim(),
      password: loginForm.value.password
    };

    // Petición al backend
    const response = await api.post('/v1/auth', payload);

    const { accessToken, tokenType, expiresIn, user } = response.data;

    if (!accessToken) {
      errorMsg.value = 'El servidor no devolvió un token de acceso';
      return;
    }

    // Guardar token y datos del usuario
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('tokenType', tokenType || 'Bearer');
    localStorage.setItem('expiresIn', expiresIn);
    localStorage.setItem('user', JSON.stringify(user));

    // Configurar autorización para futuras peticiones Axios
    api.defaults.headers.common.Authorization =
      `${tokenType || 'Bearer'} ${accessToken}`;

    // Notificar al componente padre que el inicio de sesión fue exitoso
    emit('login-success', user);

  } catch (error) {
    console.error('Error al iniciar sesión:', error);

    if (error.response?.status === 401) {
      errorMsg.value =
        'Credenciales incorrectas o cuenta no disponible';
    } else if (error.response?.status === 400) {
      errorMsg.value =
        error.response.data?.message ||
        'Verifica los datos ingresados';
    } else {
      errorMsg.value =
        error.response?.data?.message ||
        'No fue posible conectar con el servidor';
    }

  } finally {
    loading.value = false;
  }
};

// Mostrar u ocultar contraseña
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="login-page">

    <div class="login-card">

      <!-- Encabezado -->
      <div class="login-header">
        <h1>Iniciar sesión</h1>
        <p>Ingresa tus credenciales para continuar</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="iniciarSesion">

        <!-- Correo o usuario -->
        <div class="form-group">
          <label for="identifier">
            Correo electrónico o usuario
          </label>

          <input
            id="identifier"
            v-model="loginForm.identifier"
            type="text"
            placeholder="Ingresa tu correo o usuario"
            autocomplete="username"
            maxlength="254"
            :disabled="loading"
          />
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label for="password">
            Contraseña
          </label>

          <div class="password-wrapper">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
              :disabled="loading"
            />

            <button
              type="button"
              class="btn-toggle-password"
              @click="togglePassword"
              :disabled="loading"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>

        <!-- Mensaje de error -->
        <p v-if="errorMsg" class="login-error">
          ⚠️ {{ errorMsg }}
        </p>

        <!-- Botón de acceso -->
        <button
          type="submit"
          class="btn-login"
          :disabled="loading"
        >
          {{ loading ? 'Iniciando sesión...' : 'Ingresar' }}
        </button>

      </form>

    </div>

  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f1f5f9;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 35px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.10);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  margin-bottom: 8px;
  color: #1e293b;
  font-size: 27px;
}

.login-header p {
  color: #64748b;
  font-size: 14px;
}

.login-card .form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.login-card label {
  margin-bottom: 8px;
  color: #334155;
  font-weight: 600;
  font-size: 14px;
}

.login-card input {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  outline: none;
  box-sizing: border-box;
  font-size: 14px;
}

.login-card input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.password-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.password-wrapper input {
  padding-right: 80px;
}

.btn-toggle-password {
  position: absolute;
  right: 10px;
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.login-error {
  padding: 10px;
  margin-bottom: 18px;
  border-radius: 6px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 13px;
}

.btn-login {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 7px;
  background: #2563eb;
  color: white;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-login:hover {
  background: #1d4ed8;
}

.btn-login:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>
