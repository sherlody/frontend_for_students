
<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';
import '../style.css';

// Lista de empleados
const employees = ref([]);

// Mensajes
const errorMsg = ref('');
const modalError = ref('');

// Estados de los modales
const showAddModal = ref(false);
const showEditModal = ref(false);

// Estado de carga de la tabla
const loading = ref(false);

// Formulario para agregar
const addForm = ref({
  user_id: '',
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  job_title: '',
  hired_at: '',
  is_active: true
});

// Formulario para editar
const editForm = ref({
  id: null,
  user_id: '',
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  job_title: '',
  hired_at: '',
  is_active: true
});

// Obtener todos los empleados
const obtenerEmpleados = async () => {
  loading.value = true;
  errorMsg.value = '';

  try {
    const response = await api.get('/v2/employees');

    if (response.data && Array.isArray(response.data.data)) {
      employees.value = response.data.data;
    } else {
      employees.value = [];
    }

  } catch (error) {
    errorMsg.value =
      error.response?.data?.message ||
      'Error al obtener los empleados del servidor';

    console.error(error);

  } finally {
    loading.value = false;
  }
};

// Abrir modal para agregar
const openAddModal = () => {
  addForm.value = {
    user_id: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    job_title: '',
    hired_at: '',
    is_active: true
  };

  modalError.value = '';
  showAddModal.value = true;
};

// Validar formulario
const validarFormulario = (form) => {
  if (!String(form.user_id).trim()) {
    return 'El ID del usuario es obligatorio';
  }

  if (!form.first_name.trim()) {
    return 'El nombre del empleado es obligatorio';
  }

  if (!form.last_name.trim()) {
    return 'Los apellidos del empleado son obligatorios';
  }

  return null;
};

// Preparar datos para enviar al servidor
const prepararPayload = (form) => {
  const payload = {
    user_id: String(form.user_id).trim(),
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    phone: form.phone.trim() || null,
    address: form.address.trim() || null,
    job_title: form.job_title.trim() || null,
    is_active: form.is_active
  };

  // Solo enviar la fecha cuando tenga un valor
  if (form.hired_at) {
    payload.hired_at = form.hired_at;
  }

  return payload;
};

// Guardar nuevo empleado
const guardarNuevoEmpleado = async () => {
  const validationError = validarFormulario(addForm.value);

  if (validationError) {
    modalError.value = validationError;
    return;
  }

  try {
    modalError.value = '';

    const payload = prepararPayload(addForm.value);

    await api.post('/v2/employees', payload);

    showAddModal.value = false;

    await obtenerEmpleados();

  } catch (error) {
    modalError.value =
      error.response?.data?.message ||
      'Error al crear el empleado';

    console.error(error);
  }
};

// Abrir modal para editar
const openEditModal = (employee) => {
  editForm.value = {
    id: employee.id,
    user_id: String(employee.user_id),
    first_name: employee.first_name || '',
    last_name: employee.last_name || '',
    phone: employee.phone || '',
    address: employee.address || '',
    job_title: employee.job_title || '',
    hired_at: employee.hired_at
      ? String(employee.hired_at).slice(0, 10)
      : '',
    is_active: employee.is_active
  };

  modalError.value = '';
  showEditModal.value = true;
};

// Actualizar empleado
const actualizarEmpleado = async () => {
  const validationError = validarFormulario(editForm.value);

  if (validationError) {
    modalError.value = validationError;
    return;
  }

  try {
    modalError.value = '';

    const payload = prepararPayload(editForm.value);

    await api.put(
      `/v2/employees/${editForm.value.id}`,
      payload
    );

    showEditModal.value = false;

    await obtenerEmpleados();

  } catch (error) {
    modalError.value =
      error.response?.data?.message ||
      'Error al actualizar el empleado';

    console.error(error);
  }
};

// Eliminar empleado
const eliminarEmpleado = async (id) => {
  if (!confirm(
    `¿Estás seguro de que deseas eliminar al empleado con ID ${id}?`
  )) {
    return;
  }

  try {
    await api.delete(`/v2/employees/${id}`);

    await obtenerEmpleados();

  } catch (error) {
    alert(
      error.response?.data?.message ||
      'Error al eliminar el empleado'
    );

    console.error(error);
  }
};

// Formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';

  const fechaTexto = String(fecha).slice(0, 10);
  const [year, month, day] = fechaTexto.split('-');

  return `${day}/${month}/${year}`;
};

// Consultar empleados al montar el componente
onMounted(() => {
  obtenerEmpleados();
});
</script>

<template>
  <div class="container">

    <!-- Encabezado -->
    <div class="header-section">
      <h1>Empleados</h1>

      <button
        @click="openAddModal"
        class="btn btn-add"
      >
        ➕ Agregar Nuevo Empleado
      </button>
    </div>

    <!-- Mensaje de error -->
    <p v-if="errorMsg" class="error-text">
      ⚠️ {{ errorMsg }}
    </p>

    <!-- Tabla de empleados -->
    <div
      class="table-container"
      v-if="employees.length > 0"
    >
      <table class="roles-table">

        <thead>
          <tr>
            <th>ID</th>
            <th>ID Usuario</th>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Puesto</th>
            <th>Fecha de contratación</th>
            <th>Estado</th>
            <th class="actions-column">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="employee in employees"
            :key="employee.id"
          >
            <td>{{ employee.id }}</td>

            <td>{{ employee.user_id }}</td>

            <td class="role-name">
              {{ employee.first_name }}
            </td>

            <td>{{ employee.last_name }}</td>

            <td>{{ employee.phone || 'Sin teléfono' }}</td>

            <td>{{ employee.address || 'Sin dirección' }}</td>

            <td>{{ employee.job_title || 'Sin puesto' }}</td>

            <td>
              {{ formatearFecha(employee.hired_at) }}
            </td>

            <td>
              <span
                :class="employee.is_active
                  ? 'status-active'
                  : 'status-inactive'"
              >
                {{ employee.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td>
              <div class="actions-wrapper">

                <button
                  @click="openEditModal(employee)"
                  class="btn btn-edit"
                >
                  ✏️ Editar
                </button>

                <button
                  @click="eliminarEmpleado(employee.id)"
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
      Cargando empleados desde la base de datos...
    </p>

    <!-- Sin registros -->
    <p
      v-else-if="!errorMsg"
      class="loading-text"
    >
      No hay empleados registrados.
    </p>

    <!-- Modal para agregar empleado -->
    <div
      v-if="showAddModal"
      class="modal-backdrop"
    >
      <div class="modal-content">

        <h2>Registrar Nuevo Empleado</h2>

        <p v-if="modalError" class="error-text">
          ⚠️ {{ modalError }}
        </p>

        <div class="form-group">
          <label>ID del Usuario:</label>

          <input
            v-model="addForm.user_id"
            type="number"
            min="1"
            step="1"
            placeholder="Ej. 1"
          />
        </div>

        <div class="form-group">
          <label>Nombre:</label>

          <input
            v-model="addForm.first_name"
            type="text"
            maxlength="100"
            placeholder="Nombre del empleado"
          />
        </div>

        <div class="form-group">
          <label>Apellidos:</label>

          <input
            v-model="addForm.last_name"
            type="text"
            maxlength="100"
            placeholder="Apellidos del empleado"
          />
        </div>

        <div class="form-group">
          <label>Teléfono:</label>

          <input
            v-model="addForm.phone"
            type="tel"
            maxlength="20"
            placeholder="Número telefónico"
          />
        </div>

        <div class="form-group">
          <label>Dirección:</label>

          <textarea
            v-model="addForm.address"
            placeholder="Dirección del empleado"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Puesto de trabajo:</label>

          <input
            v-model="addForm.job_title"
            type="text"
            maxlength="60"
            placeholder="Ej. Administrador"
          />
        </div>

        <div class="form-group">
          <label>Fecha de contratación:</label>

          <input
            v-model="addForm.hired_at"
            type="date"
          />
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
            @click="guardarNuevoEmpleado"
            class="btn btn-save"
          >
            Guardar Empleado
          </button>

        </div>
      </div>
    </div>

    <!-- Modal para editar empleado -->
    <div
      v-if="showEditModal"
      class="modal-backdrop"
    >
      <div class="modal-content">

        <h2>Editar Empleado (ID: {{ editForm.id }})</h2>

        <p v-if="modalError" class="error-text">
          ⚠️ {{ modalError }}
        </p>

        <div class="form-group">
          <label>ID del Usuario:</label>

          <input
            v-model="editForm.user_id"
            type="number"
            min="1"
            step="1"
          />
        </div>

        <div class="form-group">
          <label>Nombre:</label>

          <input
            v-model="editForm.first_name"
            type="text"
            maxlength="100"
          />
        </div>

        <div class="form-group">
          <label>Apellidos:</label>

          <input
            v-model="editForm.last_name"
            type="text"
            maxlength="100"
          />
        </div>

        <div class="form-group">
          <label>Teléfono:</label>

          <input
            v-model="editForm.phone"
            type="tel"
            maxlength="20"
          />
        </div>

        <div class="form-group">
          <label>Dirección:</label>

          <textarea
            v-model="editForm.address"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Puesto de trabajo:</label>

          <input
            v-model="editForm.job_title"
            type="text"
            maxlength="60"
          />
        </div>

        <div class="form-group">
          <label>Fecha de contratación:</label>

          <input
            v-model="editForm.hired_at"
            type="date"
          />
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
            @click="actualizarEmpleado"
            class="btn btn-save"
          >
            Actualizar Cambios
          </button>

        </div>
      </div>
    </div>

  </div>
</template>
