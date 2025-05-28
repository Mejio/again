async function fetchMaterials() {
  try {
    const response = await fetch('http://localhost:5000/materials');
    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }
    const materials = await response.json();
    const tbody = document.getElementById('materials-tbody');
    tbody.innerHTML = '';
    materials.forEach(material => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50';

      const tdName = document.createElement('td');
      tdName.className = 'py-3 flex items-center space-x-4 text-gray-700';
      const icon = document.createElement('img');
      icon.className = 'w-4 h-4 flex-shrink-0 ml-4';
      icon.alt = material.type + ' icon';
      if (material.type === 'PDF') {
        icon.src = 'https://storage.googleapis.com/a1aa/image/14e9995f-a225-4566-16ba-31327b094c50.jpg';
      } else if (material.type === 'DOC' || material.type === 'DOCX') {
        icon.src = 'https://storage.googleapis.com/a1aa/image/08bb1fe3-6b3d-451d-d99c-8ba1a30964cf.jpg';
      } else if (material.type === 'LINK') {
        icon.src = 'https://storage.googleapis.com/a1aa/image/fbc5ff21-41db-4d69-f82c-f78df459647e.jpg';
      } else {
        icon.src = 'https://storage.googleapis.com/a1aa/image/14e9995f-a225-4566-16ba-31327b094c50.jpg';
      }
      const link = document.createElement('a');
      // Prepend backend URL to material.url to avoid redirect issues
      const backendUrl = 'http://localhost:5000';
      link.href = backendUrl + material.url;
      link.textContent = material.title;
      link.className = 'material-link';
      link.target = '_blank';
      tdName.appendChild(icon);
      tdName.appendChild(link);

      const tdType = document.createElement('td');
      tdType.className = 'py-3 text-center font-semibold text-gray-700';
      tdType.textContent = material.type;

      const tdDate = document.createElement('td');
      tdDate.className = 'py-3 text-center';
      tdDate.textContent = material.dateAdded;

      const tdSize = document.createElement('td');
      tdSize.className = 'py-3 text-center';
      tdSize.textContent = material.size;

      const tdActions = document.createElement('td');
      tdActions.className = 'py-3 text-center';

      const btnRemove = document.createElement('button');
      btnRemove.className = 'text-red-600 hover:text-red-800';
      btnRemove.title = 'Remove material';
      btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
      btnRemove.addEventListener('click', async () => {
        try {
          const response = await fetch(`http://localhost:5000/materials/${material.id}`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete material');
          }
          tr.remove();
        } catch (error) {
          alert('Error deleting material: ' + error.message);
        }
      });

      tdActions.appendChild(btnRemove);

      tr.appendChild(tdName);
      tr.appendChild(tdType);
      tr.appendChild(tdDate);
      tr.appendChild(tdSize);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
  }
}

fetchMaterials();
