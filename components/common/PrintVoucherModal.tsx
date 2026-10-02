'use client';

import React from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Printer, X } from 'lucide-react';

export default function PrintVoucherModal() {
  const { printModal, setPrintModal } = useSchool();

  if (!printModal) return null;

  const { type, data } = printModal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[95vh] overflow-y-auto print:max-w-none print:m-0 print:border-none print:shadow-none">
        {/* Screen Toolbar (hidden in print) */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Print Document Preview ({type.replace('_', ' ')})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded transition-colors shadow-xs"
            >
              Print Document (Ctrl+P)
            </button>
            <button
              onClick={() => setPrintModal(null)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CONTENT CANVAS */}
        <div className="p-8 text-slate-900 bg-white text-xs">
          {/* 1. DUAL COPY FEE VOUCHER */}
          {type === 'fee' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-300">
                {/* Copy 1: Bank / School Copy */}
                <div className="pr-0 md:pr-4 space-y-3">
                  <div className="text-center pb-2 border-b border-slate-300">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                      [ BANK / SCHOOL COPY ]
                    </span>
                    <h2 className="text-base font-bold tracking-tight text-slate-900">
                      EduCore Enterprise Grammar School
                    </h2>
                    <p className="text-[10px] text-slate-500">Official Monthly Fee Voucher</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">VOUCHER NO</span>
                      <span className="font-bold">{data.voucherNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">MONTH / DUE DATE</span>
                      <span className="font-bold">{data.month} ({data.dueDate})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">STUDENT NAME</span>
                      <span className="font-bold font-sans">{data.studentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">REG NO / CLASS</span>
                      <span className="font-bold">{data.registrationNumber} ({data.className})</span>
                    </div>
                  </div>

                  {/* Fee Heads */}
                  <table className="w-full text-left text-[11px] border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300 font-semibold">
                      <tr>
                        <th className="p-1.5">Description Head</th>
                        <th className="p-1.5 text-right">Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      <tr>
                        <td className="p-1.5 font-sans">Monthly Tuition Fee</td>
                        <td className="p-1.5 text-right">{data.tuitionFee?.toLocaleString()}</td>
                      </tr>
                      {data.annualCharges > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans">Annual Charges</td>
                          <td className="p-1.5 text-right">{data.annualCharges?.toLocaleString()}</td>
                        </tr>
                      )}
                      {data.examFee > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans">Examination Charges</td>
                          <td className="p-1.5 text-right">{data.examFee?.toLocaleString()}</td>
                        </tr>
                      )}
                      {data.computerFee > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans">Computer Lab Fee</td>
                          <td className="p-1.5 text-right">{data.computerFee?.toLocaleString()}</td>
                        </tr>
                      )}
                      {data.transportFee > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans">Transport Charges</td>
                          <td className="p-1.5 text-right">{data.transportFee?.toLocaleString()}</td>
                        </tr>
                      )}
                      {data.fineAmount > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans text-rose-700">Late Overdue Fine</td>
                          <td className="p-1.5 text-right text-rose-700">+{data.fineAmount?.toLocaleString()}</td>
                        </tr>
                      )}
                      {data.discountAmount > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans text-emerald-700">Fee Concession / Discount</td>
                          <td className="p-1.5 text-right text-emerald-700">-{data.discountAmount?.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-100 font-bold border-t border-slate-300">
                        <td className="p-1.5 font-sans">Total Payable Within Due Date</td>
                        <td className="p-1.5 text-right">Rs. {data.totalPayable?.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-emerald-50 text-emerald-900 font-bold">
                        <td className="p-1.5 font-sans">Paid Amount ({data.status})</td>
                        <td className="p-1.5 text-right">Rs. {data.paidAmount?.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="pt-6 flex justify-between items-end text-[10px] text-slate-500">
                    <div>
                      <div className="border-t border-slate-400 w-24 mb-1"></div>
                      <span>Cashier / Bank Stamp</span>
                    </div>
                    <div>
                      <div className="border-t border-slate-400 w-24 mb-1"></div>
                      <span>Parent Signature</span>
                    </div>
                  </div>
                </div>

                {/* Copy 2: Student / Parent Copy */}
                <div className="pl-0 md:pl-4 space-y-3 pt-6 md:pt-0">
                  <div className="text-center pb-2 border-b border-slate-300">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                      [ STUDENT / PARENT COPY ]
                    </span>
                    <h2 className="text-base font-bold tracking-tight text-slate-900">
                      EduCore Enterprise Grammar School
                    </h2>
                    <p className="text-[10px] text-slate-500">Official Monthly Fee Voucher</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">VOUCHER NO</span>
                      <span className="font-bold">{data.voucherNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">MONTH / DUE DATE</span>
                      <span className="font-bold">{data.month} ({data.dueDate})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">STUDENT NAME</span>
                      <span className="font-bold font-sans">{data.studentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">REG NO / CLASS</span>
                      <span className="font-bold">{data.registrationNumber} ({data.className})</span>
                    </div>
                  </div>

                  {/* Fee Heads */}
                  <table className="w-full text-left text-[11px] border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300 font-semibold">
                      <tr>
                        <th className="p-1.5">Description Head</th>
                        <th className="p-1.5 text-right">Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      <tr>
                        <td className="p-1.5 font-sans">Monthly Tuition Fee</td>
                        <td className="p-1.5 text-right">{data.tuitionFee?.toLocaleString()}</td>
                      </tr>
                      {data.annualCharges > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans">Annual Charges</td>
                          <td className="p-1.5 text-right">{data.annualCharges?.toLocaleString()}</td>
                        </tr>
                      )}
                      {data.examFee > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans">Examination Charges</td>
                          <td className="p-1.5 text-right">{data.examFee?.toLocaleString()}</td>
                        </tr>
                      )}
                      {data.computerFee > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans">Computer Lab Fee</td>
                          <td className="p-1.5 text-right">{data.computerFee?.toLocaleString()}</td>
                        </tr>
                      )}
                      {data.transportFee > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans">Transport Charges</td>
                          <td className="p-1.5 text-right">{data.transportFee?.toLocaleString()}</td>
                        </tr>
                      )}
                      {data.fineAmount > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans text-rose-700">Late Overdue Fine</td>
                          <td className="p-1.5 text-right text-rose-700">+{data.fineAmount?.toLocaleString()}</td>
                        </tr>
                      )}
                      {data.discountAmount > 0 && (
                        <tr>
                          <td className="p-1.5 font-sans text-emerald-700">Fee Concession / Discount</td>
                          <td className="p-1.5 text-right text-emerald-700">-{data.discountAmount?.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-100 font-bold border-t border-slate-300">
                        <td className="p-1.5 font-sans">Total Payable Within Due Date</td>
                        <td className="p-1.5 text-right">Rs. {data.totalPayable?.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-emerald-50 text-emerald-900 font-bold">
                        <td className="p-1.5 font-sans">Paid Amount ({data.status})</td>
                        <td className="p-1.5 text-right">Rs. {data.paidAmount?.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="pt-6 flex justify-between items-end text-[10px] text-slate-500">
                    <div>
                      <div className="border-t border-slate-400 w-24 mb-1"></div>
                      <span>Cashier / Bank Stamp</span>
                    </div>
                    <div>
                      <div className="border-t border-slate-400 w-24 mb-1"></div>
                      <span>Parent Signature</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SALARY PAY SLIP */}
          {type === 'salary' && (
            <div className="space-y-4 max-w-xl mx-auto border border-slate-300 p-6 rounded">
              <div className="text-center pb-3 border-b border-slate-300">
                <h2 className="text-base font-bold tracking-tight text-slate-900">
                  EduCore Enterprise Grammar & College
                </h2>
                <p className="text-[11px] text-slate-500">Staff Confidential Salary Pay Slip</p>
                <span className="font-mono text-xs font-bold text-slate-700 block mt-1">
                  Month: {data.month}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">SLIP NO:</span>
                  <span className="font-bold">{data.slipNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PAYMENT DATE:</span>
                  <span className="font-bold">{data.paymentDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">EMPLOYEE NAME:</span>
                  <span className="font-bold font-sans">{data.staffName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">DESIGNATION:</span>
                  <span className="font-bold font-sans">{data.designation}</span>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300">
                  <tr>
                    <th className="p-2">Earnings & Base</th>
                    <th className="p-2 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr>
                    <td className="p-2 font-sans">Base Contract Salary</td>
                    <td className="p-2 text-right">Rs. {data.baseSalary?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans text-emerald-700">+ Allowances & Performance Incentives</td>
                    <td className="p-2 text-right text-emerald-700">+Rs. {data.allowances?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans text-rose-700">- Deductions (Income Tax / Leaves)</td>
                    <td className="p-2 text-right text-rose-700">-Rs. {data.deductions?.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-sm">
                    <td className="p-2 font-sans">Net Disbursed Take-Home</td>
                    <td className="p-2 text-right">Rs. {data.netSalary?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-8 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <div className="border-t border-slate-400 w-32 mb-1"></div>
                  <span>Authorized Accounts Signatory</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-32 mb-1"></div>
                  <span>Employee Signature</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. ACADEMIC REPORT CARD */}
          {type === 'report_card' && (
            <div className="space-y-5 max-w-2xl mx-auto border-2 border-slate-800 p-8 rounded">
              <div className="text-center pb-4 border-b-2 border-slate-800">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                  EduCore Enterprise Grammar School
                </h2>
                <p className="text-xs text-slate-600 font-medium">Academic Progress & Examination Report Card</p>
                <span className="font-mono text-xs text-slate-500 block mt-0.5">Session: 2026-2027</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">STUDENT NAME</span>
                  <span className="font-bold font-sans">{data.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">REGISTRATION NO</span>
                  <span className="font-bold">{data.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">CLASS & SECTION</span>
                  <span className="font-bold">{data.className} ({data.sectionName})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">CLASS POSITION</span>
                  <span className="font-bold text-emerald-800 font-sans">#{data.positionRank || 1} Rank</span>
                </div>
              </div>

              {/* Subject Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 font-semibold">
                  <tr>
                    <th className="p-2">Subject Curriculum</th>
                    <th className="p-2 text-center">Max Marks</th>
                    <th className="p-2 text-center">Obtained Marks</th>
                    <th className="p-2 text-center">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {data.subjectMarks?.map((sub: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2 font-sans font-medium text-slate-800">{sub.subjectName}</td>
                      <td className="p-2 text-center">{sub.totalMarks}</td>
                      <td className="p-2 text-center font-bold text-slate-900">{sub.obtainedMarks}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">{sub.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold border-t border-slate-300">
                    <td className="p-2 font-sans">Consolidated Academic Aggregate</td>
                    <td className="p-2 text-center">{data.totalMarks}</td>
                    <td className="p-2 text-center text-slate-900">{data.obtainedMarks}</td>
                    <td className="p-2 text-center text-emerald-700">{data.grade}</td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <div>
                  <span className="font-semibold block text-slate-700">Percentage & GPA:</span>
                  <span className="font-mono text-base font-bold text-emerald-700">
                    {data.percentage}% (GPA: {data.gpa?.toFixed(1)})
                  </span>
                </div>
                <div>
                  <span className="font-semibold block text-slate-700">Faculty Remarks:</span>
                  <span className="text-slate-700 italic">{data.remarks || 'Excellent performance.'}</span>
                </div>
              </div>

              <div className="pt-10 flex justify-between items-end text-xs text-slate-600">
                <div>
                  <div className="border-t border-slate-400 w-36 mb-1"></div>
                  <span>Class Teacher Signature</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-36 mb-1"></div>
                  <span>Principal Seal & Signature</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. SCHOOL LEAVING CERTIFICATE */}
          {type === 'leaving_cert' && (
            <div className="space-y-6 max-w-2xl mx-auto border-4 border-double border-slate-800 p-8 rounded">
              <div className="text-center pb-4 border-b-2 border-slate-800">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  EduCore Enterprise Grammar & College
                </h2>
                <p className="text-xs text-slate-500">Reg No: REG/SELD/2026/8941 · Registered with Education Directorate</p>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 mt-3 underline">
                  Official School Leaving & Character Certificate
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-slate-800 leading-relaxed font-serif text-justify">
                <p>
                  This is to solemnly certify that <strong className="font-sans font-bold">{data.name}</strong>, Son/Daughter
                  of <strong className="font-sans font-bold">{data.fatherName}</strong>, bearing B-Form / CNIC number{' '}
                  <span className="font-mono font-bold">{data.cnicOrBForm}</span> and School Registration Number{' '}
                  <span className="font-mono font-bold">{data.registrationNumber}</span>, was a bona-fide student of this institution.
                </p>

                <p>
                  The student was admitted on <span className="font-mono font-bold">{data.admissionDate}</span> and left this institution on{' '}
                  <span className="font-mono font-bold">{data.leavingDate || new Date().toISOString().split('T')[0]}</span>.
                </p>

                <p>
                  <strong>Reason for Leaving:</strong> {data.leavingReason || 'Completion of studies / Relocation'}.
                </p>

                <p>
                  <strong>Academic & Moral Conduct:</strong> During the tenure of attendance, their moral conduct, personal demeanor, and general academic progress were found to be{' '}
                  <strong className="font-sans font-bold">Good / Exemplary</strong>. All institutional fees and library books have been cleared.
                </p>
              </div>

              <div className="pt-12 flex justify-between items-end text-xs text-slate-700">
                <div>
                  <span className="font-mono text-[11px] text-slate-500">Date of Issue: {new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-800 w-44 mb-1"></div>
                  <span className="font-semibold">Principal & Head of Institution</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. BOOK SALE INVOICE */}
          {type === 'book_slip' && (
            <div className="space-y-4 max-w-md mx-auto border border-slate-300 p-6 rounded">
              <div className="text-center pb-2 border-b border-slate-300">
                <h2 className="text-sm font-bold text-slate-900 uppercase">EduCore Bookstore Counter</h2>
                <p className="text-[11px] text-slate-500">Official Courseware & Book Sale Receipt</p>
                <div className="font-mono text-xs font-bold text-slate-800 mt-1">{data.slipNumber}</div>
              </div>

              <div className="text-[11px] font-mono space-y-1">
                <div>Student: <span className="font-sans font-bold">{data.studentName}</span> ({data.className})</div>
                <div>Date: {data.date}</div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-1.5">Book Title</th>
                    <th className="p-1.5 text-center">Qty</th>
                    <th className="p-1.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {data.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-1.5 font-sans">{item.bookTitle}</td>
                      <td className="p-1.5 text-center">{item.quantity}</td>
                      <td className="p-1.5 text-right">Rs. {item.total?.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={2} className="p-1.5 font-sans">Total Bill</td>
                    <td className="p-1.5 text-right">Rs. {data.totalAmount?.toLocaleString()}</td>
                  </tr>
                  <tr className="text-emerald-700 font-bold">
                    <td colSpan={2} className="p-1.5 font-sans">Paid</td>
                    <td className="p-1.5 text-right">Rs. {data.paidAmount?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-center text-[10px] text-slate-400 pt-3">
                Sold by: {data.soldBy || 'Librarian'} · Valid School Bookshop Receipt
              </div>
            </div>
          )}

          {/* 6. DAY BOOK PRINT */}
          {type === 'daybook' && (
            <div className="space-y-4">
              <div className="text-center pb-3 border-b border-slate-300">
                <h2 className="text-base font-bold text-slate-900 uppercase">
                  EduCore Enterprise Grammar School
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Official Day Book & Cash Reconciliation Ledger ({data.campusName})
                </p>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">As on: {data.date}</div>
              </div>

              <table className="w-full text-left text-xs border border-slate-300 font-mono tabular-nums">
                <thead className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-800">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2 text-right">Opening Balance</th>
                    <th className="p-2 text-right text-emerald-800">Fee Income</th>
                    <th className="p-2 text-right text-emerald-800">Admission</th>
                    <th className="p-2 text-right text-teal-800">Books</th>
                    <th className="p-2 text-right text-emerald-800">Sundry</th>
                    <th className="p-2 text-right text-rose-800">Expenses</th>
                    <th className="p-2 text-right font-bold text-slate-900">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.entries?.map((e: any) => (
                    <tr key={e.id}>
                      <td className="p-2 text-slate-800">{e.date}</td>
                      <td className="p-2 text-right">Rs. {e.openingBalance?.toLocaleString()}</td>
                      <td className="p-2 text-right text-emerald-700">+{e.feeCollection?.toLocaleString()}</td>
                      <td className="p-2 text-right text-emerald-700">+{e.admissionIncome?.toLocaleString()}</td>
                      <td className="p-2 text-right text-teal-700">+{e.bookSalesIncome?.toLocaleString()}</td>
                      <td className="p-2 text-right text-emerald-700">+{e.otherIncome?.toLocaleString()}</td>
                      <td className="p-2 text-right text-rose-700">-{e.totalExpense?.toLocaleString()}</td>
                      <td className="p-2 text-right font-bold text-slate-900">Rs. {e.closingBalance?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-8 flex justify-between items-end text-xs text-slate-600">
                <div>
                  <div className="border-t border-slate-400 w-36 mb-1"></div>
                  <span>Accountant / Bursar</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-36 mb-1"></div>
                  <span>Principal / Director</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
