// const API_URL = 'http://localhost:5000/api/books';
const API_URL = 'https://library-backend-bice.vercel.app/api/books';

async function fetchBooks() {
  try {
    const res  = await fetch(API_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch books');
    if (!Array.isArray(data)) throw new Error('Response is not an array');

    const tbody = document.querySelector('#books-table tbody');
    if (!tbody) throw new Error('Missing <tbody> in your table');

    tbody.innerHTML = '';
    data.forEach(book => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.description || ''}</td>
        <td>
          <button class="edit-btn"   data-id="${book._id}">Edit</button>
          <button class="delete-btn" data-id="${book._id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('❌ fetchBooks error:', err);
  }
}

async function addBook(data) {
  try {
    const res     = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.message || 'Add failed');
  } catch (err) {
    console.error('❌ addBook error:', err);
  }
}

async function updateBook(id, data) {
  try {
    const res     = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.message || 'Update failed');
  } catch (err) {
    console.error('❌ updateBook error:', err);
  }
}

async function deleteBook(id) {
  if (!confirm('Delete this book?')) return;
  try {
    const res     = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.message || 'Delete failed');
    await fetchBooks();
  } catch (err) {
    console.error('❌ deleteBook error:', err);
  }
}

let editId = null;
function startEdit(id) {
  if (!id) {
    console.error('❌ startEdit called without an ID');
    return;
  }
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(book => {
      if (book.message) throw new Error(book.message);
      document.getElementById('title').value       = book.title;
      document.getElementById('author').value      = book.author;
      document.getElementById('description').value = book.description || '';
      editId = id;
      document.querySelector('#book-form button').textContent = 'Update Book';
    })
    .catch(err => console.error('❌ startEdit error:', err));
}

// form submit
document.getElementById('book-form').addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    title:       e.target.title.value.trim(),
    author:      e.target.author.value.trim(),
    description: e.target.description.value.trim(),
  };

  if (editId) {
    await updateBook(editId, data);
    editId = null;
    e.target.querySelector('button').textContent = 'Add Book';
  } else {
    await addBook(data);
  }

  e.target.reset();
  fetchBooks();
});

// delegate button clicks
document
  .querySelector('#books-table tbody')
  .addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (e.target.matches('.edit-btn'))   startEdit(id);
    if (e.target.matches('.delete-btn')) deleteBook(id);
  });

// initial load
window.addEventListener('DOMContentLoaded', fetchBooks);
