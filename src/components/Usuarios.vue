
<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';
import '../style.css';

// Listas
const usuarios = ref([]);
const roles = ref([]);

// Mensajes
const errorMsg = ref('');
const modalError = ref('');

// Estados de los modales
const showAddModal = ref(false);
const showEditModal = ref(false);

// Estado de carga
const loading = ref(false);

// Formulario para registrar usuario
const addForm = ref({
  username: '',
  email: '',
  password: '',
  role_id: '',
  is_active: true
});

// Formulario para editar usuario
const editForm = ref({
  id: null,
  username: '',
  email: '',
  password: '',
  role_id: '',
  is_active: true
});

// Obtener usuarios
const obtenerUsuarios = async () => {
  loading.value = true;
  errorMsg.value = '';

  try {
    const response = await api.get('/v2/usuarios');

    if (response.data && Array.isArray(response.data.data)) {
      usuarios.value = response.data.data;
    } else {
      usuarios.value = [];
    }

  } catch (error) {
    errorMsg.value =
      error.response?.data?.message ||
      'Error al obtener los usuarios del servidor';

    console.error(error);

  } finally {
    loading.value = false;
  }
};

// Obtener roles para los selectores
const obtenerRoles = async () => {
  try {
    const response = await api.get('/v2/roles');

    if (response.data && Array.isArray(response.data.data)) {
      roles.value = response.data.data;
    } else {
      roles.value = [];
    }

  } catch (error) {
    console.error('Error al obtener los roles:', error);
    errorMsg.value =
      error.response?.data?.message ||
      'No fue posible obtener los roles';
  }
};

// Buscar nombre del rol por su ID
const obtenerNombreRol = (roleId) => {
  const rol = roles.value.find(
    (item) => Number(item.id) === Number(roleId)
  );

  return rol ? rol.name : `Rol ID: ${roleId}`;
};

// Abrir modal para agregar
const openAddModal = () => {
  addForm.value = {
    username: '',
    email: '',
    password: '',
    role_id: '',
    is_active: true
  };

  modalError.value = '';
  showAddModal.value = true;
};

// Validar formulario
const validarFormulario = (form, creando = false) => {
  if (!form.username.trim()) {
    return 'El nombre de usuario es obligatorio';
  }

  if (!form.email.trim()) {
    return 'El correo electrónico es obligatorio';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return 'Ingresa un correo electrónico válido';
  }

  if (creando && !form.password) {
    return 'La contraseña es obligatoria';
  }

  if (form.password && form.password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }

  if (form.password && new TextEncoder().encode(form.password).length > 72) {
    return 'La contraseña no puede exceder 72 bytes';
  }

  if (!form.role_id || !Number.isSafeInteger(Number(form.role_id)) ||
      Number(form.role_id) < 1) {
    return 'Debes seleccionar un rol';
  }

  return null;
};

// Preparar datos para enviar
const prepararPayload = (form, creando = false) => {
  const payload = {
    username: form.username.trim(),
    email: form.email.trim(),
    role_id: Number(form.role_id),
    is_active: form.is_active
  };

  // En edición, solo se envía la contraseña si se escribió una nueva
  if (creando || form.password) {
    payload.password = form.password;
  }

  return payload;
};

// Registrar usuario
const guardarNuevoUsuario = async () => {
  const validationError = validarFormulario(addForm.value, true);

  if (validationError) {
    modalError.value = validationError;
    return;
  }

  try {
    modalError.value = '';

    const payload = prepararPayload(addForm.value, true);

    await api.post('/v2/users', payload);

    showAddModal.value = false;

    await obtenerUsuarios();

  } catch (error) {
    modalError.value =
      error.response?.data?.message ||
      'Error al crear el usuario';

    console.error(error);
  }
};

// Abrir modal de edición
const openEditModal = (usuario) => {
  editForm.value = {
    id: usuario.id,
    username: usuario.username || '',
    email: usuario.email || '',
    password: '',
    role_id: usuario.role_id,
    is_active: usuario.is_active
  };

  modalError.value = '';
  showEditModal.value = true;
};

// Actualizar usuario
const actualizarUsuario = async () => {
  const validationError = validarFormulario(editForm.value, false);

  if (validationError) {
    modalError.value = validationError;
    return;
  }

  try {
    modalError.value = '';

    const payload = prepararPayload(editForm.value, false);

    await api.put(
      `/v2/users/${editForm.value.id}`,
      payload
    );

    showEditModal.value = false;

    await obtenerUsuarios();

  } catch (error) {
    modalError.value =
      error.response?.data?.message ||
      'Error al actualizar el usuario';

    console.error(error);
  }
};

// Cambiar estado del usuario
const cambiarEstado = async (usuario) => {
  const nuevoEstado = !usuario.is_active;

  const mensaje = nuevoEstado
    ? '¿Deseas activar este usuario?'
    : '¿Deseas desactivar este usuario?';

  if (!confirm(mensaje)) return;

  try {
    await api.put(`/v2/users/${usuario.id}`, {
      is_active: nuevoEstado
    });

    await obtenerUsuarios();

  } catch (error) {
    alert(
      error.response?.data?.message ||
      'Error al cambiar el estado del usuario'
    );
  }
};

// Eliminar usuario
const eliminarUsuario = async (id) => {
  if (!confirm(
    `¿Estás seguro de que deseas eliminar el usuario con ID ${id}?`
  )) {
    return;
  }

  try {
    await api.delete(`/v2/users/${id}`);

    await obtenerUsuarios();

  } catch (error) {
    alert(
      error.response?.data?.message ||
      'Error al eliminar el usuario'
    );

    console.error(error);
  }
};

// Formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';

  return new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Cargar información al montar
onMounted(async () => {
  await obtenerRoles();
  await obtenerUsuarios();
});
</script>

<template>
  <div class="container">

    <!-- Encabezado -->
    <div class="header-section">
      <h1>Usuarios</h1>

      <button
        @click="openAddModal"
        class="btn btn-add"
        :disabled="roles.length === 0"
      >
        ➕ Agregar Nuevo Usuario
      </button>
    </div>

    <!-- Mensaje de error -->
    <p v-if="errorMsg" class="error-text">
      ⚠️ {{ errorMsg }}
    </p>

    <!-- Tabla de usuarios -->
    <div
      class="table-container"
      v-if="usuarios.length > 0"
    >
      <table class="roles-table">

        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre de usuario</th>
            <th>Correo electrónico</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Fecha de creación</th>
            <th class="actions-column">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="usuario in usuarios"
            :key="usuario.id"
          >
            <td>{{ usuario.id }}</td>

            <td class="role-name">
              {{ usuario.username }}
            </td>

            <td>{{ usuario.email }}</td>

            <td>
              {{ obtenerNombreRol(usuario.role_id) }}
            </td>

            <td>
              <span
                :class="usuario.is_active
                  ? 'status-active'
                  : 'status-inactive'"
              >
                {{ usuario.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td>
              {{ formatearFecha(usuario.created_at) }}
            </td>

            <td>
              <div class="actions-wrapper">

                <button
                  @click="openEditModal(usuario)"
                  class="btn btn-edit"
                >
                  ✏️ Editar
                </button>

                <button
                  @click="cambiarEstado(usuario)"
                  class="btn"
                  :class="usuario.is_active
                    ? 'btn-delete'
                    : 'btn-save'"
                >
                  {{ usuario.is_active ? 'Desactivar' : 'Activar' }}
                </button>

                <button
                  @click="eliminarUsuario(usuario.id)"
                  class="btn btn-delete"
                >
                  🗑️ Eliminar
                </button>

              </div>
            </td>
          </tr>
        </tbody>

      </table>
    </div>

    <!-- Cargando -->
    <p
      v-else-if="loading"
      class="loading-text"
    >
      Cargando usuarios desde la base de datos...
    </p>

    <!-- Sin registros -->
    <p
      v-else-if="!errorMsg"
      class="loading-text"
    >
      No hay usuarios registrados.
    </p>

    <!-- Modal para agregar usuario -->
    <div
      v-if="showAddModal"
      class="modal-backdrop"
    >
      <div class="modal-content">

        <h2>Registrar Nuevo Usuario</h2>

        <p v-if="modalError" class="error-text">
          ⚠️ {{ modalError }}
        </p>

        <div class="form-group">
          <label>Nombre de usuario:</label>

          <input
            v-model="addForm.username"
            type="text"
            maxlength="30"
            placeholder="Ej. sherlin"
          />
        </div>

        <div class="form-group">
          <label>Correo electrónico:</label>

          <input
            v-model="addForm.email"
            type="email"
            maxlength="254"
            placeholder="usuario@correo.com"
          />
        </div>

        <div class="form-group">
          <label>Contraseña:</label>

          <input
            v-model="addForm.password"
            type="password"
            autocomplete="new-password"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div class="form-group">
          <label>Rol:</label>

          <select v-model.number="addForm.role_id">
            <option value="" disabled>
              Selecciona un rol
            </option>

            <option
              v-for="rol in roles"
              :key="rol.id"
              :value="Number(rol.id)"
            >
              {{ rol.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Estado:</label>

          <select v-model="addForm.is_active">
            <option :value="true">Activo</option>
            <option :value="false">Inactivo</option>
          </select>
        </div>

        <div class="modal-actions">

          <button
            @click="showAddModal = false"
            class="btn btn-cancel"
          >
            Cancelar
          </button>

          <button
            @click="guardarNuevoUsuario"
            class="btn btn-save"
          >
            Guardar Usuario
          </button>

        </div>
      </div>
    </div>

    <!-- Modal para editar usuario -->
    <div
      v-if="showEditModal"
      class="modal-backdrop"
    >
      <div class="modal-content">

        <h2>Editar Usuario (ID: {{ editForm.id }})</h2>

        <p v-if="modalError" class="error-text">
          ⚠️ {{ modalError }}
        </p>

        <div class="form-group">
          <label>Nombre de usuario:</label>

          <input
            v-model="editForm.username"
            type="text"
            maxlength="30"
          />
        </div>

        <div class="form-group">
          <label>Correo electrónico:</label>

          <input
            v-model="editForm.email"
            type="email"
            maxlength="254"
          />
        </div>

        <div class="form-group">
          <label>Nueva contraseña:</label>

          <input
            v-model="editForm.password"
            type="password"
            autocomplete="new-password"
            placeholder="Dejar vacío para conservar la actual"
          />
        </div>

        <div class="form-group">
          <label>Rol:</label>

          <select v-model.number="editForm.role_id">
            <option value="" disabled>
              Selecciona un rol
            </option>

            <option
              v-for="rol in roles"
              :key="rol.id"
              :value="Number(rol.id)"
            >
              {{ rol.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Estado:</label>

          <select v-model="editForm.is_active">
            <option :value="true">Activo</option>
            <option :value="false">Inactivo</option>
          </select>
        </div>

        <div class="modal-actions">

          <button
            @click="showEditModal = false"
            class="btn btn-cancel"
          >
            Cancelar
          </button>

          <button
            @click="actualizarUsuario"
            class="btn btn-save"
          >
            Actualizar Cambios
          </button>

        </div>
      </div>
    </div>

  </div>
</template>
