const bcrypt = require('bcrypt');

async function generarHash() {
    const password = 'Admin12345';

    const hash = await bcrypt.hash(password, 12);

    console.log('Contraseña original:', password);
    console.log('Hash generado:', hash);
}

generarHash();