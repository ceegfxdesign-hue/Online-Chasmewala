import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LensMediaInput } from './LensMediaInput';
const mocks = vi.hoisted(()=>({post:vi.fn(),error:vi.fn()}));
vi.mock('@/services/api',()=>({api:{post:mocks.post,defaults:{baseURL:'https://api.example.com/api/v1'}}}));
vi.mock('@/contexts/ToastContext',()=>({useToast:()=>({success:vi.fn(),error:mocks.error})}));
describe('lens media input',()=>{
 it('uploads multipart media and uses the API origin for the durable URL',async()=>{
  mocks.post.mockResolvedValue({data:{data:{url:'/api/v1/lens-media/abc'}}});
  const change = vi.fn();
  render(<LensMediaInput label="Lens image" onChange={change}/>);
  fireEvent.change(screen.getByLabelText('Upload lens image'),{target:{files:[new File(['image'],'lens.png',{type:'image/png'})]}});
  await waitFor(()=>expect(change).toHaveBeenCalledWith('https://api.example.com/api/v1/lens-media/abc'));
  expect(mocks.post.mock.calls[0][1]).toBeInstanceOf(FormData);
 });
 it('rejects unsupported media before uploading',()=>{
  mocks.post.mockClear();
  render(<LensMediaInput label="Video" kind="video" onChange={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Upload video'),{target:{files:[new File(['html'],'bad.html',{type:'text/html'})]}});
  expect(mocks.post).not.toHaveBeenCalled();
  expect(mocks.error).toHaveBeenCalled();
 });
});
