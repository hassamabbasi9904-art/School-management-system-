import { NextResponse } from 'next/server';
import { store, recordFinancialTransaction } from '@/lib/data-store';
import { Book, BookSaleSlip } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const type = searchParams.get('type'); // 'books' or 'slips'

  if (type === 'slips') {
    let slips = store.bookSaleSlips;
    if (campusId && campusId !== 'all') {
      slips = slips.filter((s) => s.campusId === campusId);
    }
    return NextResponse.json(slips);
  }

  let books = store.books;
  if (campusId && campusId !== 'all') {
    books = books.filter((b) => b.campusId === campusId);
  }

  return NextResponse.json({
    books,
    slips: store.bookSaleSlips,
    totalStockValue: books.reduce((acc, b) => acc + b.stockQuantity * b.unitPrice, 0),
    totalSalesAmount: store.bookSaleSlips.reduce((acc, s) => acc + s.totalAmount, 0),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action: Generate Book Sale Slip
    if (action === 'saleSlip') {
      const {
        studentId,
        studentName,
        registrationNumber,
        className,
        campusId,
        items, // [{ bookId, quantity }]
        paidAmount,
        paymentMethod = 'Cash',
        soldBy = 'Librarian',
      } = body;

      let totalAmount = 0;
      const slipItems = [];

      for (const item of items) {
        const book = store.books.find((b) => b.id === item.bookId);
        if (book) {
          const qty = Number(item.quantity);
          const total = qty * book.unitPrice;
          totalAmount += total;
          book.stockQuantity = Math.max(0, book.stockQuantity - qty); // deduct stock
          slipItems.push({
            bookId: book.id,
            bookTitle: book.title,
            quantity: qty,
            unitPrice: book.unitPrice,
            total,
          });
        }
      }

      const paid = Number(paidAmount);
      const remainingAmount = Math.max(0, totalAmount - paid);
      const slipNumber = `BKS-2026-${(store.bookSaleSlips.length + 41).toString().padStart(4, '0')}`;

      const saleSlip: BookSaleSlip = {
        id: `bs-${Date.now()}`,
        slipNumber,
        studentId,
        studentName,
        registrationNumber,
        className,
        campusId: campusId || store.campuses[0].id,
        date: new Date().toISOString().split('T')[0],
        items: slipItems,
        totalAmount,
        paidAmount: paid,
        remainingAmount,
        paymentMethod,
        soldBy,
      };

      store.bookSaleSlips.unshift(saleSlip);

      // AUTOMATED DAY BOOK & CASH LEDGER HOOK
      if (paid > 0) {
        recordFinancialTransaction({
          type: 'INCOME',
          sourceOrCategory: 'Book Sales Income',
          description: `Book sale slip ${saleSlip.slipNumber} for ${saleSlip.studentName}`,
          referenceNo: saleSlip.slipNumber,
          amount: paid,
          campusId: saleSlip.campusId,
          performedBy: soldBy,
        });
      }

      return NextResponse.json({ success: true, slip: saleSlip });
    }

    // Action: Return Book / Restore Stock
    if (action === 'returnBook') {
      const { bookId, quantity } = body;
      const book = store.books.find((b) => b.id === bookId);
      if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      book.stockQuantity += Number(quantity);
      return NextResponse.json({ success: true, book });
    }

    // Add New Book to Inventory
    const newBook: Book = {
      id: `bk-${Date.now()}`,
      title: body.title,
      author: body.author,
      classId: body.classId,
      className: body.className || 'General',
      category: body.category || 'Textbook',
      isbn: body.isbn || `ISBN-${Date.now().toString().slice(-6)}`,
      stockQuantity: Number(body.stockQuantity) || 0,
      unitPrice: Number(body.unitPrice) || 0,
      campusId: body.campusId || store.campuses[0].id,
    };

    store.books.unshift(newBook);
    return NextResponse.json(newBook);
  } catch {
    return NextResponse.json({ error: 'Failed to process book request' }, { status: 500 });
  }
}
