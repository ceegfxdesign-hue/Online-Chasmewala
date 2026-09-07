import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LensPackageDetails } from './LensPackageDetails';
describe('Lens package details',()=>{
 it('shows comparison media, benefits, illustrated features and selection footer',()=>{
  const select=vi.fn();
  render(<LensPackageDetails pack={{name:'Premium',price:500,mrp:1000,detailImageUrl:'/hero.jpg',comparisonImageUrl:'/comparison.jpg',features:['Anti-glare'],detailFeatures:[{title:'Clear vision',imageUrl:'/feature.jpg'}]}} framePrice={2000} onClose={vi.fn()} onSelect={select}/>);
  expect(screen.getByText('Top Benefits')).toBeInTheDocument();
  expect(screen.getByText('Clear vision')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Compare lens images'),{target:{value:'70'}});
  expect(screen.getByAltText('Lens comparison')).toHaveStyle({clipPath:'inset(0 30% 0 0)'});
  fireEvent.click(screen.getByRole('button',{name:'Select This Lens'}));
  expect(select).toHaveBeenCalledOnce();
 });
});
