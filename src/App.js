import React, { useState, useEffect } from "react";

const mockBooks = [
  { id: 1, title: "Introduction to Databases", author: "John Smith", available: 5 },
  { id: 2, title: "Advanced SQL", author: "Jane Doe", available: 2 }
];

const mockMembers = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Lee" }
];

function App() {
  const [books, setBooks] = useState(mockBooks);
  const [members, setMembers] = useState(mockMembers);
  const [search, setSearch] = useState("");
  const [filteredBooks, setFilteredBooks] = useState(mockBooks);
  const [newMemberName, setNewMemberName] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setFilteredBooks(
      books.filter((book) =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, books]);

  const borrowBook = (bookId) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === bookId && book.available > 0
          ? { ...book, available: book.available - 1 }
          : book
      )
    );
  };

  const addMember = () => {
    if (!newMemberName.trim()) return;
    const newMember = { id: members.length + 1, name: newMemberName };
    setMembers([...members, newMember]);
    setNewMemberName("");
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Library Management System</h1>

      <input
        type="text"
        placeholder="Search books by title or author..."
        className="w-full border rounded px-4 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {filteredBooks.map((book) => (
          <div key={book.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{book.title}</h2>
            <p>Author: {book.author}</p>
            <p>Available: {book.available}</p>
            <button
              onClick={() => borrowBook(book.id)}
              disabled={book.available === 0}
              className={`mt-2 px-4 py-2 text-white rounded ${
                book.available === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Borrow Book
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Register New Member
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h3 className="text-lg font-semibold mb-2">New Member Registration</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-between">
              <button onClick={addMember} className="bg-blue-500 text-white px-4 py-2 rounded">
                Add Member
              </button>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-black">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Registered Members:</h2>
        <ul className="list-disc list-inside">
          {members.map((m) => (
            <li key={m.id}>{m.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
