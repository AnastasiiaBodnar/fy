import React from 'react';

export default function SearchBar({ value, onChange, totalCount, filteredCount }) {
  if (totalCount === 0) return null;
  
  return (
    <div style={styles.searchContainer}>
      <div style={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Пошук вакансій..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={styles.searchInput}
        />
      </div>
      <div style={styles.counterContainer}>
        <span style={styles.counter}>
          <span style={styles.counterNumber}>{filteredCount}</span>
          <span style={styles.counterText}> з {totalCount}</span>
        </span>
      </div>
    </div>
  );
}

const styles = {
  searchContainer: {
    marginBottom: '20px',
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    maxWidth: '600px'
  },
  searchInput: {
    width: '100%',
    padding: '10px 16px 10px 20px',
    fontSize: '0.9rem',
    border: '1px solid #e0e6e3',
    borderRadius: '6px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f9fbfa'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#8fa8a0',
    fontSize: '0.9rem'
  },
  counterContainer: {
    flexShrink: 0
  },
  counter: {
    color: '#1a3c34',
    fontWeight: '500',
    fontSize: '0.9rem',
    backgroundColor: '#f9fbfa',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e0e6e3'
  },
  counterNumber: {
    fontWeight: '600',
    color: '#20c997'
  },
  counterText: {
    color: '#6b8c85'
  }
};