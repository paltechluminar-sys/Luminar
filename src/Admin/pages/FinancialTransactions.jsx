import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const FinancialTransactions = () => {
  // ==================== STATE ====================
  const [transactions, setTransactions] = useState([
    { id: 1, description: 'Ad Revenue', amount: 1500, transaction_type: 'income', category: 'Sales', date: '2026-03-10', reference: 'ADV001', payment_method: 'Bank Transfer', invoice_number: 'INV-001', notes: 'Monthly ad revenue', project: 'Admin Panel', tags: ['income', 'ads'] },
    { id: 2, description: 'Server Costs', amount: 200, transaction_type: 'expense', category: 'Salaries', date: '2026-03-05', reference: 'EXP001', payment_method: 'Credit Card', invoice_number: 'INV-002', notes: 'AWS hosting', project: 'Infrastructure', tags: ['expense', 'hosting'], recurring: true },
    { id: 3, description: 'Consulting Services', amount: 800, transaction_type: 'income', category: 'Services', date: '2026-03-01', reference: 'SVC001', payment_method: 'Bank Transfer', invoice_number: 'INV-003', notes: 'Q1 Consulting', project: 'Consulting', tags: ['income'] },
    { id: 4, description: 'Marketing Campaign', amount: 300, transaction_type: 'expense', category: 'Marketing', date: '2026-02-28', reference: 'MKT001', payment_method: 'Credit Card', invoice_number: 'INV-004', notes: 'Social media ads', project: 'Marketing', tags: ['expense', 'marketing'] },
  ]);
  
  const [budgets] = useState([
    { id: 1, category: 'Salaries', limit: 2000, spent: 1200, period: 'monthly' },
    { id: 2, category: 'Marketing', limit: 500, spent: 450, period: 'monthly' },
    { id: 3, category: 'Software', limit: 800, spent: 150, period: 'monthly' },
  ]);

  const [taxes] = useState([
    { id: 1, date: '2026-01-15', type: 'Income Tax', amount: 250, dueDate: '2026-04-15', status: 'pending' },
    { id: 2, date: '2025-12-15', type: 'VAT', amount: 180, dueDate: '2026-01-15', status: 'paid' },
  ]);

  const [financialGoals] = useState([
    { id: 1, name: 'Q1 Revenue Target', targetAmount: 5000, currentAmount: 3100, dueDate: '2026-03-31', category: 'Revenue' },
    { id: 2, name: 'Reduce Expenses', targetAmount: 1000, currentAmount: 950, dueDate: '2026-03-31', category: 'Cost' },
  ]);

  const [activeTab, setActiveTab] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({ search: '', type: '', category: '', dateFrom: '', dateTo: '', project: '' });
  const [dateRange, setDateRange] = useState({ from: '2026-02-01', to: '2026-03-31' });

  const [formData, setFormData] = useState({
    description: '', amount: '', transaction_type: 'income', category: 'Sales',
    date: new Date().toISOString().split('T')[0], reference: '', payment_method: 'Bank Transfer',
    notes: '', invoice_number: '', project: 'General', tags: [], recurring: false, recurringInterval: 'monthly'
  });

  // ==================== CALCULATIONS ====================
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const dateOk = (!dateRange.from || t.date >= dateRange.from) && (!dateRange.to || t.date <= dateRange.to);
      const searchOk = !filters.search || t.description.toLowerCase().includes(filters.search.toLowerCase());
      const typeOk = !filters.type || t.transaction_type === filters.type;
      const categoryOk = !filters.category || t.category === filters.category;
      const projectOk = !filters.project || t.project === filters.project;
      return dateOk && searchOk && typeOk && categoryOk && projectOk;
    });
  };

  const calculateFinancials = (txns = transactions) => {
    const income = txns.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = txns.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;
    const marginPercent = income > 0 ? (net / income) * 100 : 0;
    const roi = expense > 0 ? (net / expense) * 100 : 0;
    return { income, expense, net, marginPercent, roi };
  };

  const stats = calculateFinancials();
  const filteredStats = calculateFinancials(getFilteredTransactions());

  const getTaxTotal = () => taxes.reduce((sum, t) => sum + t.amount, 0);
  const getTaxPaid = () => taxes.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
  const getTaxPending = () => taxes.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);

  // ==================== HANDLERS ====================
  const handleSaveTransaction = () => {
    if (!formData.description || !formData.amount || !formData.category) {
      setError('Fill all required fields');
      return;
    }

    const newData = { ...formData, amount: parseFloat(formData.amount) };
    if (editingId) {
      setTransactions(transactions.map(t => t.id === editingId ? { ...newData, id: editingId } : t));
      setSuccessMessage('Transaction updated!');
    } else {
      newData.id = Math.max(...transactions.map(t => t.id || 0), 0) + 1;
      setTransactions([...transactions, newData]);
      setSuccessMessage('Transaction added!');
    }
    setOpenDialog(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm('Delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
      setSuccessMessage('Transaction deleted!');
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Project', 'Invoice', 'Notes'];
    const rows = getFilteredTransactions().map(t => [t.date, t.description, t.category, t.transaction_type, t.amount, t.project, t.invoice_number || '', t.notes || '']);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ==================== RENDER ====================
  return (
    <div className="assets-container">
      {successMessage && <Alert severity="success" className="success-alert">{successMessage}</Alert>}
      {error && <Alert severity="error" className="error-alert">{error}</Alert>}

      {/* HEADER */}
      <div className="assets-header-simple">
        <h2 className="assets-title">💰 Advanced Financial Management</h2>
        <TextField size="small" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="assets-search-input" />
        <button className="btn" onClick={() => { setEditingId(null); setFormData({...formData, description: '', amount: ''}); setOpenDialog(true); }} style={{ padding: '6px 12px', fontSize: '12px', background: '#00a884', borderRadius: '4px', marginLeft: 'auto' }}>+ Add</button>
      </div>

      {/* MAIN METRICS */}
      <Grid container spacing={1} style={{ padding: '12px', background: '#111b21' }}>
        <Grid item xs={12} sm={6} md={3}><KPICard label="Total Income" value={`$${stats.income.toFixed(2)}`} color="#00a884" trend="+12%" /></Grid>
        <Grid item xs={12} sm={6} md={3}><KPICard label="Total Expense" value={`$${stats.expense.toFixed(2)}`} color="#e74c3c" trend="-5%" /></Grid>
        <Grid item xs={12} sm={6} md={3}><KPICard label="Net Profit" value={`$${stats.net.toFixed(2)}`} color={stats.net >= 0 ? '#00a884' : '#e74c3c'} trend={`${stats.marginPercent.toFixed(1)}%`} /></Grid>
        <Grid item xs={12} sm={6} md={3}><KPICard label="ROI" value={`${stats.roi.toFixed(1)}%`} color="#6c63ff" trend={stats.roi > 100 ? "Excellent" : "Good"} /></Grid>
      </Grid>

      {/* TABS */}
      <Box style={{ background: '#1a2c35', margin: '0 12px', marginTop: '12px', borderRadius: '4px', border: '1px solid #1f2b30' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Dashboard" style={{ color: activeTab === 0 ? '#00a884' : '#8696a0' }} />
          <Tab label="Transactions" style={{ color: activeTab === 1 ? '#00a884' : '#8696a0' }} />
          <Tab label="Reports & Analytics" style={{ color: activeTab === 2 ? '#00a884' : '#8696a0' }} />
          <Tab label="Budgets & Forecasts" style={{ color: activeTab === 3 ? '#00a884' : '#8696a0' }} />
          <Tab label="Tax & Goals" style={{ color: activeTab === 4 ? '#00a884' : '#8696a0' }} />
        </Tabs>
      </Box>

      {/* TAB 0: DASHBOARD */}
      {activeTab === 0 && <Dashboard stats={stats} transactions={transactions} budgets={budgets} taxes={taxes} financialGoals={financialGoals} />}

      {/* TAB 1: TRANSACTIONS */}
      {activeTab === 1 && (
        <Box style={{ padding: '12px', background: '#111b21' }}>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            <TextField label="From Date" type="date" size="small" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField label="To Date" type="date" size="small" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} InputLabelProps={{ shrink: true }} />
            <FormControl size="small">
              <InputLabel>Type</InputLabel>
              <Select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} label="Type">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Category</InputLabel>
              <Select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} label="Category">
                <MenuItem value="">All</MenuItem>
                {[...new Set(transactions.map(t => t.category))].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Project</InputLabel>
              <Select value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })} label="Project">
                <MenuItem value="">All</MenuItem>
                {[...new Set(transactions.map(t => t.project))].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <Button onClick={exportCSV} variant="outlined" size="small" style={{ color: '#00a884', borderColor: '#00a884' }}>📥 Export</Button>
          </Box>

          <TableContainer component={Paper} className="assets-table-container">
            <Table size="small">
              <TableHead>
                <TableRow className="table-header">
                  <TableCell style={{fontSize:'11px'}}>Date</TableCell>
                  <TableCell style={{fontSize:'11px'}}>Description</TableCell>
                  <TableCell style={{fontSize:'11px'}}>Category</TableCell>
                  <TableCell style={{fontSize:'11px'}}>Project</TableCell>
                  <TableCell style={{fontSize:'11px'}}>Type</TableCell>
                  <TableCell align="right" style={{fontSize:'11px'}}>Amount</TableCell>
                  <TableCell style={{fontSize:'11px'}}>Invoice</TableCell>
                  <TableCell align="center" style={{fontSize:'11px'}}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredTransactions().map(t => (
                  <TableRow key={t.id} className="table-row">
                    <TableCell style={{fontSize:'12px'}}>{t.date}</TableCell>
                    <TableCell style={{fontSize:'12px'}}><div>{t.description}</div>{t.notes && <div style={{fontSize:'10px',color:'#8696a0'}}>{t.notes}</div>}</TableCell>
                    <TableCell style={{fontSize:'12px'}}><Chip label={t.category} size="small" style={{background: t.transaction_type === 'income' ? '#00a88411' : '#e74c3c11', color: t.transaction_type === 'income' ? '#00a884' : '#e74c3c'}} /></TableCell>
                    <TableCell style={{fontSize:'12px'}}>{t.project}</TableCell>
                    <TableCell style={{fontSize:'12px'}}>{t.transaction_type}</TableCell>
                    <TableCell align="right" style={{fontSize:'12px', color: t.transaction_type === 'income' ? '#00a884' : '#e74c3c', fontWeight:'bold'}}>{t.transaction_type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}</TableCell>
                    <TableCell style={{fontSize:'12px'}}>{t.invoice_number || '-'}</TableCell>
                    <TableCell align="center"><button className="action-btn" onClick={() => { setEditingId(t.id); setFormData(t); setOpenDialog(true); }} style={{marginRight:'4px'}}><FiEdit style={{fontSize:'12px'}} /></button><button className="action-btn" onClick={() => handleDeleteTransaction(t.id)} style={{color:'#e74c3c'}}><FiTrash2 style={{fontSize:'12px'}} /></button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 2: REPORTS & ANALYTICS */}
      {activeTab === 2 && (
        <Box style={{ padding: '12px', background: '#111b21' }}>
          <Grid container spacing={2}>
            {/* INCOME STATEMENT */}
            <Grid item xs={12} md={6}>
              <Card style={{background:'#1a2c35', border:'1px solid #1f2b30'}}>
                <CardContent>
                  <h3 style={{color:'#e9edef', marginTop:0}}>📊 Income Statement</h3>
                  <ReportLine label="Total Income" value={`$${filteredStats.income.toFixed(2)}`} color="#00a884" />
                  <ReportLine label="Total Expense" value={`$${filteredStats.expense.toFixed(2)}`} color="#e74c3c" />
                  <hr style={{borderColor:'#1f2b30'}} />
                  <ReportLine label="Net Profit/Loss" value={`$${filteredStats.net.toFixed(2)}`} color={filteredStats.net >= 0 ? '#00a884' : '#e74c3c'} bold />
                  <ReportLine label="Profit Margin" value={`${filteredStats.marginPercent.toFixed(1)}%`} />
                  <ReportLine label="ROI" value={`${filteredStats.roi.toFixed(1)}%`} />
                </CardContent>
              </Card>
            </Grid>

            {/* CATEGORY BREAKDOWN */}
            <Grid item xs={12} md={6}>
              <Card style={{background:'#1a2c35', border:'1px solid #1f2b30'}}>
                <CardContent>
                  <h3 style={{color:'#e9edef', marginTop:0}}>📈 Category Breakdown</h3>
                  {transactions.filter(t => t.transaction_type === 'income').reduce((acc, t) => {
                    const existing = acc.find(x => x.cat === t.category);
                    if (existing) existing.amt += t.amount;
                    else acc.push({cat: t.category, amt: t.amount});
                    return acc;
                  }, []).map(x => <ReportLine key={x.cat} label={x.cat} value={`$${x.amt.toFixed(2)}`} color="#00a884" />)}
                </CardContent>
              </Card>
            </Grid>

            {/* MONTHLY TRENDS */}
            <Grid item xs={12}>
              <Card style={{background:'#1a2c35', border:'1px solid #1f2b30'}}>
                <CardContent>
                  <h3 style={{color:'#e9edef', marginTop:0}}>📅 Monthly Trends</h3>
                  {Array.from({length:3}, (_, i) => {
                    const date = new Date(2026, 2-i, 1);
                    const month = date.toISOString().substring(0, 7);
                    const monthTx = transactions.filter(t => t.date.startsWith(month));
                    const mi = monthTx.filter(t => t.transaction_type === 'income').reduce((s, t) => s + t.amount, 0);
                    const me = monthTx.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + t.amount, 0);
                    return (
                      <div key={month} style={{marginBottom:'12px', paddingBottom:'12px', borderBottom:'1px solid #1f2b30'}}>
                        <div style={{color:'#8696a0', fontSize:'12px', fontWeight:'bold'}}>{month}</div>
                        <ReportLine label="Income" value={`$${mi.toFixed(2)}`} color="#00a884" />
                        <ReportLine label="Expense" value={`$${me.toFixed(2)}`} color="#e74c3c" />
                        <ReportLine label="Balance" value={`$${(mi-me).toFixed(2)}`} color={mi-me >= 0 ? '#00a884' : '#e74c3c'} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 3: BUDGETS */}
      {activeTab === 3 && (
        <Box style={{ padding: '12px', background: '#111b21' }}>
          <h3 style={{color:'#e9edef'}}>💰 Budget Tracking</h3>
          <Grid container spacing={2}>
            {budgets.map(b => (
              <Grid item xs={12} sm={6} md={4} key={b.id}>
                <Card style={{background:'#1a2c35', border:'1px solid #1f2b30'}}>
                  <CardContent>
                    <div style={{color:'#e9edef', fontWeight:'bold', marginBottom:'8px'}}>{b.category}</div>
                    <div style={{fontSize:'12px', color:'#8696a0', marginBottom:'8px'}}>Spent: ${b.spent.toFixed(2)} / ${b.limit.toFixed(2)}</div>
                    <LinearProgress variant="determinate" value={(b.spent / b.limit) * 100} style={{marginBottom:'8px', height:'6px', borderRadius:'3px'}} />
                    <div style={{fontSize:'11px', color: b.spent > b.limit ? '#e74c3c' : '#00a884'}}>{((b.spent/b.limit)*100).toFixed(0)}% Used</div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <h3 style={{color:'#e9edef', marginTop:'20px'}}>🎯 Financial Forecast</h3>
          <Card style={{background:'#1a2c35', border:'1px solid #1f2b30'}}>
            <CardContent>
              <div>Based on current trends for Q1 2026:</div>
              <ReportLine label="Projected Income (Q1)" value={`$${(stats.income * 1.1).toFixed(2)}`} color="#00a884" />
              <ReportLine label="Projected Expense (Q1)" value={`$${(stats.expense * 1.05).toFixed(2)}`} color="#e74c3c" />
              <ReportLine label="Estimated Profit (Q1)" value={`$${(stats.income * 1.1 - stats.expense * 1.05).toFixed(2)}`} color="#6c63ff" bold />
            </CardContent>
          </Card>
        </Box>
      )}

      {/* TAB 4: TAX & GOALS */}
      {activeTab === 4 && (
        <Box style={{ padding: '12px', background: '#111b21' }}>
          <Grid container spacing={2}>
            {/* TAX TRACKING */}
            <Grid item xs={12} md={6}>
              <h3 style={{color:'#e9edef'}}>🧮 Tax Tracking</h3>
              <KPICard label="Total Tax Liability" value={`$${getTaxTotal().toFixed(2)}`} color="#6c63ff" />
              <Card style={{background:'#1a2c35', border:'1px solid #1f2b30', marginTop:'12px'}}>
                <CardContent>
                  <div style={{fontSize:'12px', marginBottom:'8px'}}>Paid: <span style={{color:'#00a884'}}>${getTaxPaid().toFixed(2)}</span></div>
                  <div style={{fontSize:'12px'}}>Pending: <span style={{color:'#e74c3c'}}>${getTaxPending().toFixed(2)}</span></div>
                  {taxes.map(t => (
                    <div key={t.id} style={{padding:'8px', background:'#111b21', borderRadius:'4px', marginTop:'8px', fontSize:'12px'}}>
                      <div>{t.type} - ${t.amount.toFixed(2)}</div>
                      <div style={{fontSize:'10px', color:'#8696a0'}}>Due: {t.dueDate} | Status: <span style={{color: t.status === 'paid' ? '#00a884' : '#e74c3c'}}>{t.status}</span></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* FINANCIAL GOALS */}
            <Grid item xs={12} md={6}>
              <h3 style={{color:'#e9edef'}}>🎯 Financial Goals</h3>
              {financialGoals.map(g => (
                <Card key={g.id} style={{background:'#1a2c35', border:'1px solid #1f2b30', marginBottom:'12px'}}>
                  <CardContent>
                    <div style={{color:'#e9edef', fontWeight:'bold', marginBottom:'8px'}}>{g.name}</div>
                    <div style={{fontSize:'12px', color:'#8696a0', marginBottom:'8px'}}>Progress: ${g.currentAmount.toFixed(2)} / ${g.targetAmount.toFixed(2)}</div>
                    <LinearProgress variant="determinate" value={(g.currentAmount / g.targetAmount) * 100} style={{marginBottom:'8px'}} />
                    <div style={{fontSize:'11px', display:'flex', justifyContent:'space-between'}}>
                      <span style={{color: g.currentAmount >= g.targetAmount ? '#00a884' : '#8696a0'}}>{((g.currentAmount/g.targetAmount)*100).toFixed(0)}% Complete</span>
                      <span style={{color:'#8696a0'}}>Due: {g.dueDate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </Box>
      )}

      {/* DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit' : 'Add'} Transaction</DialogTitle>
        <DialogContent className="dialog-content">
          <TextField autoFocus margin="dense" label="Description *" fullWidth variant="outlined" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} sx={{mb:2, mt:2}} />
          <TextField margin="dense" label="Amount *" type="number" fullWidth variant="outlined" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} sx={{mb:2}} />
          <FormControl fullWidth sx={{mb:2}}>
            <InputLabel>Type *</InputLabel>
            <Select value={formData.transaction_type} onChange={(e) => setFormData({...formData, transaction_type: e.target.value})} label="Type">
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{mb:2}}>
            <InputLabel>Category *</InputLabel>
            <Select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} label="Category">
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Services">Services</MenuItem>
              <MenuItem value="Salaries">Salaries</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="Software">Software</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="dense" label="Date *" type="date" fullWidth variant="outlined" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} InputLabelProps={{shrink:true}} sx={{mb:2}} />
          <FormControl fullWidth sx={{mb:2}}>
            <InputLabel>Project</InputLabel>
            <Select value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})} label="Project">
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Admin Panel">Admin Panel</MenuItem>
              <MenuItem value="Infrastructure">Infrastructure</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="Consulting">Consulting</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="dense" label="Invoice Number" fullWidth variant="outlined" value={formData.invoice_number} onChange={(e) => setFormData({...formData, invoice_number: e.target.value})} sx={{mb:2}} />
          <TextField margin="dense" label="Reference" fullWidth variant="outlined" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} sx={{mb:2}} />
          <TextField margin="dense" label="Notes" multiline rows={3} fullWidth variant="outlined" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} sx={{mb:2}} />
          <FormControlLabel control={<Switch checked={formData.recurring} onChange={(e) => setFormData({...formData, recurring: e.target.checked})} />} label="Recurring Transaction" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTransaction} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// ==================== COMPONENTS ====================
const KPICard = ({ label, value, color, trend }) => (
  <Card style={{background:'#1a2c35', border:`1px solid ${color}44`, height:'100%'}}>
    <CardContent>
      <div style={{color:'#8696a0', fontSize:'12px', marginBottom:'8px'}}>{label}</div>
      <div style={{color, fontSize:'24px', fontWeight:'bold', marginBottom:'4px'}}>{value}</div>
      {trend && <div style={{fontSize:'11px', color:color}}>{trend}</div>}
    </CardContent>
  </Card>
);

const ReportLine = ({ label, value, color = '#e9edef', bold = false }) => (
  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', color:color, fontSize:'12px', fontWeight: bold ? 'bold' : 'normal'}}>
    <span>{label}</span>
    <span style={{fontWeight:'bold'}}>{value}</span>
  </div>
);

const Dashboard = ({ stats, transactions, budgets, taxes, financialGoals }) => (
  <Box style={{padding:'12px', background:'#111b21'}}>
    <h3 style={{color:'#e9edef'}}>📊 Quick Summary</h3>
    <Grid container spacing={2} style={{marginBottom:'20px'}}>
      <Grid item xs={12} sm={6}><Card style={{background:'#1a2c35', border:'1px solid #1f2b30'}}><CardContent><div style={{fontSize:'12px', color:'#8696a0'}}>Top Categories</div>{transactions.reduce((acc,t)=>{const x=acc.find(a=>a.c===t.category);x?x.a+=t.amount:acc.push({c:t.category,a:t.amount});return acc},[]).sort((a,b)=>b.a-a.a).slice(0,3).map(x=><ReportLine key={x.c} label={x.c} value={`$${x.a.toFixed(2)}`} color="#00a884" />)}</CardContent></Card></Grid>
      <Grid item xs={12} sm={6}><Card style={{background:'#1a2c35', border:'1px solid #1f2b30'}}><CardContent><div style={{fontSize:'12px', color:'#8696a0'}}>Budget Status</div>{budgets.map(b=><div key={b.id} style={{fontSize:'11px', marginBottom:'4px'}}><span style={{color: b.spent > b.limit ? '#e74c3c' : '#00a884'}}>{b.category}</span>: {((b.spent/b.limit)*100).toFixed(0)}%</div>)}</CardContent></Card></Grid>
    </Grid>
  </Box>
);

export default FinancialTransactions;
