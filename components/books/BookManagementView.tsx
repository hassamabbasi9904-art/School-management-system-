'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Book, BookSaleSlip, ClassItem, Student } from '@/types';
import {
  BookOpen,
  PlusCircle,
  Search,
  ShoppingCart,
  Printer,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

export default function BookManagementView() {
  const { activeCampusId, campuses, setPrintModal } = useSchool();
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales'>('inventory');
  const [books, setBooks] = useState<Book[]>([]);
  const [slips, setSlips] = useState<BookSaleSlip[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isSaleSlipOpen, setIsSaleSlipOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [returnQty, setReturnQty] = useState(1);

  // Add Book Form
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    classId: '',
    className: '',
    category: 'Textbook',
    isbn: '',
    stockQuantity: 50,
    unitPrice: 850,
    campusId: '',
  });

  // Sale Slip Form
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [customStudentName, setCustomStudentName] = useState('');
  const [customClass, setCustomClass] = useState('Grade 1');
  const [saleItems, setSaleItems] = useState<{ bookId: string; quantity: number }[]>([
    { bookId: '', quantity: 1 },
  ]);
  const [salePaidAmount, setSalePaidAmount] = useState(0);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      const [bRes, aRes, sRes] = await Promise.all([
        fetch(`/api/books?campusId=${activeCampusId}`),
        fetch('/api/academics'),
        fetch(`/api/students?campusId=${activeCampusId}`),
      ]);

      if (bRes.ok) {
        const data = await bRes.json();
        setBooks(data.books || []);
        setSlips(data.slips || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setClasses(aData.classes || []);
      }
      if (sRes.ok) {
        setStudents(await sRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookData();
  }, [activeCampusId]);

  // Handle Add Book Submit
  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cls = classes.find((c) => c.id === bookForm.classId);
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookForm,
          className: cls?.name || 'General',
          campusId: bookForm.campusId || (activeCampusId !== 'all' ? activeCampusId : campuses[0]?.id),
        }),
      });

      if (res.ok) {
        setIsAddBookOpen(false);
        fetchBookData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Sale Slip Submit
  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const student = students.find((s) => s.id === selectedStudentId);
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saleSlip',
          studentId: student?.id,
          studentName: student?.name || customStudentName || 'Walk-in Student',
          registrationNumber: student?.registrationNumber || 'N/A',
          className: student ? classes.find((c) => c.id === student.classId)?.name || 'Class' : customClass,
          campusId: student?.campusId || (activeCampusId !== 'all' ? activeCampusId : campuses[0]?.id),
          items: saleItems.filter((i) => i.bookId && i.quantity > 0),
          paidAmount: salePaidAmount,
          soldBy: 'Librarian / Bookshop',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsSaleSlipOpen(false);
        // Print Book Slip
        setPrintModal({
          type: 'book_slip',
          data: data.slip,
        });
        fetchBookData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Book Return
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'returnBook',
          bookId: selectedBook.id,
          quantity: returnQty,
        }),
      });

      if (res.ok) {
        setIsReturnOpen(false);
        fetchBookData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate live total for sale slip form
  const computedSaleTotal = saleItems.reduce((acc, item) => {
    const book = books.find((b) => b.id === item.bookId);
    return acc + (book ? book.unitPrice * (item.quantity || 1) : 0);
  }, 0);

  const filteredBooks = books.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-700" />
            Books Inventory & Bookstore Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Course curriculum texts, bookstore issue/sale slips, inventory stock tracking, and Day Book integration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSaleItems([{ bookId: books[0]?.id || '', quantity: 1 }]);
              setSalePaidAmount(books[0]?.unitPrice || 0);
              setIsSaleSlipOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Issue / Sell Books Slip
          </button>

          <button
            onClick={() => {
              setBookForm({
                title: '',
                author: '',
                classId: classes[0]?.id || '',
                className: classes[0]?.name || '',
                category: 'Textbook',
                isbn: '',
                stockQuantity: 50,
                unitPrice: 850,
                campusId: activeCampusId !== 'all' ? activeCampusId : (campuses[0]?.id || 'camp-1'),
              });
              setIsAddBookOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add New Title
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Book Inventory ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === 'sales' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sales & Issue Slips ({slips.length})
        </button>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Total Stock Units: {books.reduce((acc, b) => acc + b.stockQuantity, 0)}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Book Title</th>
                    <th className="py-2.5 px-3 font-medium">Author</th>
                    <th className="py-2.5 px-3 font-medium">Target Class</th>
                    <th className="py-2.5 px-3 font-medium">Category</th>
                    <th className="py-2.5 px-3 font-medium">ISBN / Code</th>
                    <th className="py-2.5 px-3 font-medium text-right">In-Stock Qty</th>
                    <th className="py-2.5 px-3 font-medium text-right">Unit Price</th>
                    <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Loading book catalog...
                      </td>
                    </tr>
                  ) : filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No books matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{b.title}</td>
                        <td className="py-2.5 px-3 text-slate-600">{b.author}</td>
                        <td className="py-2.5 px-3 text-slate-700">{b.className}</td>
                        <td className="py-2.5 px-3 text-slate-500">{b.category}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{b.isbn}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                          <span
                            className={
                              b.stockQuantity < 10
                                ? 'text-rose-700'
                                : b.stockQuantity < 25
                                ? 'text-amber-700'
                                : 'text-slate-800'
                            }
                          >
                            {b.stockQuantity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 font-medium">
                          Rs. {b.unitPrice?.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            title="Return / Restock Quantity"
                            onClick={() => {
                              setSelectedBook(b);
                              setReturnQty(1);
                              setIsReturnOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SALES SLIPS TAB */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Slip #</th>
                  <th className="py-2.5 px-3 font-medium">Date</th>
                  <th className="py-2.5 px-3 font-medium">Student Name</th>
                  <th className="py-2.5 px-3 font-medium">Class</th>
                  <th className="py-2.5 px-3 font-medium">Items Summary</th>
                  <th className="py-2.5 px-3 font-medium text-right">Total (PKR)</th>
                  <th className="py-2.5 px-3 font-medium text-right">Paid</th>
                  <th className="py-2.5 px-3 font-medium text-right">Print Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slips.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No book sale slips generated yet.
                    </td>
                  </tr>
                ) : (
                  slips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{slip.slipNumber}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{slip.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{slip.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-700">{slip.className}</td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                        {slip.items?.map((i) => `${i.bookTitle} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        Rs. {slip.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-medium">
                        Rs. {slip.paidAmount?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          title="Print Book Slip"
                          onClick={() => setPrintModal({ type: 'book_slip', data: slip })}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD BOOK MODAL */}
      {isAddBookOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Add Book to Inventory</h3>
              <button onClick={() => setIsAddBookOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="e.g. Oxford Progressive English Book 2"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Author / Publisher</label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="e.g. Rachel Redford"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Class</label>
                  <select
                    value={bookForm.classId}
                    onChange={(e) => setBookForm({ ...bookForm, classId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={bookForm.stockQuantity}
                    onChange={(e) => setBookForm({ ...bookForm, stockQuantity: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Unit Price (PKR)</label>
                  <input
                    type="number"
                    min="1"
                    value={bookForm.unitPrice}
                    onChange={(e) => setBookForm({ ...bookForm, unitPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Category</label>
                  <select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs"
                  >
                    <option value="Textbook">Textbook</option>
                    <option value="Exercise Book">Exercise Book</option>
                    <option value="Guide">Guide</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddBookOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Save Title to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE / SALE SLIP MODAL */}
      {isSaleSlipOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Issue Book Sale Slip</h3>
                <p className="text-xs text-slate-500">Auto-deducts stock and records income in Day Book</p>
              </div>
              <button onClick={() => setIsSaleSlipOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Select Registered Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      const stu = students.find((s) => s.id === e.target.value);
                      if (stu) {
                        setCustomStudentName(stu.name);
                        setCustomClass(classes.find((c) => c.id === stu.classId)?.name || '');
                      }
                    }}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    <option value="">-- Or enter walk-in below --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.registrationNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Student Name (Walk-in)</label>
                  <input
                    type="text"
                    value={customStudentName}
                    onChange={(e) => setCustomStudentName(e.target.value)}
                    placeholder="Student name"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              {/* Books Selection */}
              <div>
                <label className="font-medium text-slate-700 block mb-1">Select Books</label>
                {saleItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <select
                      value={item.bookId}
                      onChange={(e) => {
                        const updated = [...saleItems];
                        updated[index].bookId = e.target.value;
                        setSaleItems(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="">Select a book</option>
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} (Rs. {b.unitPrice} · {b.stockQuantity} left)
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...saleItems];
                        updated[index].quantity = Number(e.target.value);
                        setSaleItems(updated);
                      }}
                      className="w-16 px-2 py-1.5 border border-slate-200 rounded text-xs font-mono"
                    />

                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => setSaleItems(saleItems.filter((_, i) => i !== index))}
                        className="text-rose-600 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setSaleItems([...saleItems, { bookId: books[0]?.id || '', quantity: 1 }])}
                  className="text-xs text-emerald-700 font-medium hover:underline mt-1"
                >
                  + Add another book
                </button>
              </div>

              {/* Calculation & Payment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Slip Amount</span>
                  <span className="font-mono text-base font-bold text-slate-900">
                    Rs. {computedSaleTotal.toLocaleString()}
                  </span>
                </div>

                <div className="w-36">
                  <label className="text-slate-500 block text-[11px] mb-1">Paid Amount (PKR)</label>
                  <input
                    type="number"
                    value={salePaidAmount || computedSaleTotal}
                    onChange={(e) => setSalePaidAmount(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSaleSlipOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-xs"
                >
                  Generate Slip & Print
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTOCK / RETURN MODAL */}
      {isReturnOpen && selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Restock / Return Book</h3>
              <button onClick={() => setIsReturnOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleReturnSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded">
                <div className="font-medium text-slate-900">{selectedBook.title}</div>
                <div className="text-slate-500 font-mono text-[11px]">Current Stock: {selectedBook.stockQuantity}</div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Quantity to Return / Restock *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={returnQty}
                  onChange={(e) => setReturnQty(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReturnOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Update Inventory Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
