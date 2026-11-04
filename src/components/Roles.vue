<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';
import '../style.css';

const roles = ref([]);
const errorMsg = ref('');

const showAddModal = ref(false);
const showEditModal = ref(false);

const addForm = ref({ name: '', description: '' });
const editForm = ref({ id: null, name: '', description: '' });

const obtenerRoles = async () => {
  try {
    const response = await api.get('/v2/roles');
    // Tu controlador envía: { total: X, data: [ ... ] }
    if (response.data && Array.isArray(response.data.data)) {
      roles.value = response.data.data;
    }
  } catch (error) {
    errorMsg.value = 'Error al obtener los roles del servidor';
    console.error(error);
  }
};

const openAddModal = () => {
  addForm.value = { name: '', description: '' };
  errorMsg.value = '';
  showAddModal.value = true;
};

const guardarNuevoRol = async () => {
  if (!addForm.value.name.trim()) {
    alert("El nombre del rol es obligatorio");
    return;
  }
  try {
    const payload = {
      name: addForm.value.name.trim(),
      description: addForm.value.description.trim() || null
    };
    
    await api.post('/v2/roles', payload);
    showAddModal.value = false;
    await obtenerRoles(); // Recargar tabla
  } catch (error) {
    //capturar los errores de validación del back
    errorMsg.value = error.response?.data?.message || 'Error al crear el rol';
  }
};

const openEditModal = (rol) => {
  editForm.value = { 
    id: rol.id, 
    name: rol.name, 
    description: rol.description || '' 
  };
  errorMsg.value = '';
  showEditModal.value = true;
};

const actualizarRol = async () => {
  if (!editForm.value.name.trim()) {
    alert("El nombre del rol no puede quedar vacío");
    return;
  }
  try {
    const payload = {
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim() || null
    };

    await api.put(`/v2/roles/${editForm.value.id}`, payload);
    showEditModal.value = false;
    await obtenerRoles();
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Error al actualizar el rol';
  }
};

const eliminarRol = async (id) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar el rol con ID ${id}?`)) return;
  try {
    await api.delete(`/v2/roles/${id}`);
    await obtenerRoles(); 
  } catch (error) {
    alert(error.response?.data?.message || 'Error al eliminar el rol');
  }
};

onMounted(() => {
  obtenerRoles();
});
</script>

<template>
  <div class="container">
    <div class="header-section">
      <h1>Roles</h1>
      <button @click="openAddModal" class="btn btn-add">➕ Agregar Nuevo Rol</button>
    </div>

    <p v-if="errorMsg" class="error-text">⚠️ {{ errorMsg }}</p>
    
    <div class="table-container" v-if="roles.length > 0">
      <table class="roles-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Rol</th>
            <th>Descripción</th>
            <th class="actions-column">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rol in roles" :key="rol.id">
            <td>{{ rol.id }}</td>
            <td class="role-name">{{ rol.name }}</td>
            <td>{{ rol.description || 'Sin descripción' }}</td>
            <td>
              <div class="actions-wrapper">
                <button @click="openEditModal(rol)" class="btn btn-edit">✏️ Editar</button>
                <button @click="eliminarRol(rol.id)" class="btn btn-delete">🗑️ Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <p v-else-if="!errorMsg" class="loading-text">Cargando roles desde la base de datos...</p>

    <!--modal para agregar un rol -->
    <div v-if="showAddModal" class="modal-backdrop">
      <div class="modal-content">
        <h2>Crear Nuevo Rol</h2>
        <div class="form-group">
          <label>Nombre del Rol:</label>
          <input v-model="addForm.name" type="text" placeholder="Ej. admin, manager, cashier" maxlength="30" />
        </div>
        <div class="form-group">
          <label>Descripción:</label>
          <textarea v-model="addForm.description" placeholder="Describe los permisos del rol..."></textarea>
        </div>
        <div class="modal-actions">
          <button @click="showAddModal = false" class="btn btn-cancel">Cancelar</button>
          <button @click="guardarNuevoRol" class="btn btn-save">Guardar Rol</button>
        </div>
      </div>
    </div>

    <!--modal para editar un rol -->
    <div v-if="showEditModal" class="modal-backdrop">
      <div class="modal-content">
        <h2>Editar Rol (ID: {{ editForm.id }})</h2>
        <div class="form-group">
          <label>Nombre del Rol:</label>
          <input v-model="editForm.name" type="text" maxlength="30" />
        </div>
        <div class="form-group">
          <label>Descripción:</label>
          <textarea v-model="editForm.description"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="showEditModal = false" class="btn btn-cancel">Cancelar</button>
          <button @click="actualizarRol" class="btn btn-save">Actualizar Cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>