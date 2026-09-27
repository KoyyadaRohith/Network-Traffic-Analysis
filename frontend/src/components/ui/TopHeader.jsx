import React from 'react';
import Header from '../Header';

/**
 * TopHeader — Global Application Header Component
 *
 * Implements the required academic identity:
 * Primary title: NETWORK TRAFFIC ANALYSIS
 * Secondary: Data Warehousing & Data Mining
 * Metadata: CICIDS2017 • MySQL • Random Forest
 */
export default function TopHeader(props) {
  return <Header {...props} />;
}
