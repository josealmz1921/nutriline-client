import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, useFormApi } from 'informed';
import Input from './Input';
import Textarea from './Textarea';
import Checkbox from './Checkbox';
import Toggle from './Toggle';
import InputFile from './InputFile';
import Select from './Select';
import SelectControl from './Select/components/SelectControl';
import RadioGroup from './RadioGroup';
import DatePicker from './DatePicker';
import Dialog from './Dialog';
import Collapsible from './Collapsible';
import Dropzone from './Dropzone';
import BulkActions from './BulkActions';
import ToolTip from './ToolTip';
import BlogEditor from './BlogEditor';

afterEach(cleanup);

describe('campos Informed', () => {
  it('envía Input, Textarea y Checkbox como valores del formulario', async () => {
    const submit = vi.fn();
    const user = userEvent.setup();
    render(<Form onSubmit={submit}>
      <Input identifier="name" label="Nombre" />
      <Textarea identifier="notes" label="Notas" />
      <Checkbox identifier="accepted" label="Acepto" />
      <button type="submit">Enviar</button>
    </Form>);
    await user.type(screen.getByLabelText('Nombre'), 'Paciente ficticio');
    await user.type(screen.getByLabelText('Notas'), 'Ejemplo');
    await user.click(screen.getByLabelText('Acepto'));
    await user.click(screen.getByText('Enviar'));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0].values).toMatchObject({ name: 'Paciente ficticio', notes: 'Ejemplo', accepted: true });
  });

  it('muestra errores accesibles y no envía un campo inválido', async () => {
    const submit = vi.fn();
    const user = userEvent.setup();
    render(<Form onSubmit={submit}>
      <Input identifier="name" label="Nombre" validate={value => !value ? 'Es requerido' : undefined} />
      <button type="submit">Enviar</button>
    </Form>);
    await user.click(screen.getByText('Enviar'));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Es requerido'));
    expect(submit).not.toHaveBeenCalled();
  });

  it('Toggle guarda el booleano y recupera el control tras un fallo asíncrono', async () => {
    const user = userEvent.setup();
    const change = vi.fn().mockRejectedValueOnce(new Error('synthetic')).mockResolvedValueOnce(true);
    render(<Form><Toggle name="active" label="Activo" onChange={change} /></Form>);
    await user.click(screen.getByRole('switch'));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('No se pudo'));
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
    await user.click(screen.getByRole('switch'));
    await waitFor(() => expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true'));
  });

  it('InputFile registra una sola vez, permite quitar el archivo y no anida botones', async () => {
    const user = userEvent.setup();
    const { container } = render(<Form><InputFile field="file" label="Archivo" type="button" /></Form>);
    await user.upload(screen.getByLabelText('Archivo'), new File(['demo'], 'demo.txt', { type: 'text/plain' }));
    await screen.findByText('demo.txt');
    expect(container.querySelector('button button')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Quitar archivo' }));
    expect(screen.queryByText('demo.txt')).toBeNull();
  });

  it('RadioGroup actualiza el formulario y notifica la opción elegida', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const submit = vi.fn();
    const data = [{ id: 'yes', label: 'Sí', value: 'si' }, { id: 'no', label: 'No', value: 'no' }];
    render(<Form onSubmit={submit}><RadioGroup name="answer" data={data} onChange={change} />
      <button type="submit">Enviar</button></Form>);
    await user.click(screen.getByRole('radio', { name: 'Sí' }));
    await user.click(screen.getByText('Enviar'));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0].values.answer).toBe('si');
    expect(change).toHaveBeenCalledWith(data[0]);
  });

  it('DatePicker conserva nacimiento date-only e instantes UTC en modo datetime', async () => {
    const submit = vi.fn();
    const user = userEvent.setup();
    render(<Form onSubmit={submit} initialValues={{ birth: '1992-05-15', visit: '2026-01-01T12:00:00.000Z' }}>
      <DatePicker field="birth" label="Nacimiento" />
      <DatePicker field="visit" label="Atención" mode="datetime" />
      <button type="submit">Enviar</button>
    </Form>);
    expect((screen.getByLabelText('Nacimiento') as HTMLInputElement).value).toBe('1992-05-15');
    await user.click(screen.getByText('Enviar'));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0].values).toMatchObject({ birth: '1992-05-15', visit: '2026-01-01T12:00:00.000Z' });
  });

  it('DatePicker serializa cambios de fecha local sin desplazar el cumpleaños', async () => {
    const submit = vi.fn();
    render(<Form onSubmit={submit}>
      <DatePicker field="birth" label="Nacimiento" />
      <DatePicker field="visit" label="Atención" mode="datetime" />
      <button type="submit">Enviar</button>
    </Form>);
    fireEvent.change(screen.getByLabelText('Nacimiento'), { target: { value: '1993-06-16' } });
    fireEvent.blur(screen.getByLabelText('Nacimiento'));
    fireEvent.change(screen.getByLabelText('Atención'), { target: { value: '2026-01-02 09:30' } });
    fireEvent.blur(screen.getByLabelText('Atención'));
    fireEvent.click(screen.getByText('Enviar'));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0].values).toMatchObject({ birth: '1993-06-16', visit: new Date(2026, 0, 2, 9, 30).toISOString() });
  });
});

describe('Select', () => {
  const options = [{ value: 'one', label: 'Uno' }, { value: 'two', label: 'Dos', disabled: true }, { value: 'three', label: 'Tres' }];
  it('selecciona por teclado sin detenerse en opciones deshabilitadas', async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    render(<Form onSubmit={submit}><Select name="choice" label="Opción" options={options} />
      <button type="submit">Enviar</button></Form>);
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(screen.getByRole('combobox').textContent).toContain('Tres');
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.click(screen.getByText('Enviar'));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0].values.choice).toBe('three');
  });
  it('tolera listas vacías y todas las opciones deshabilitadas sin bucles', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SelectControl options={options.map(option => ({ ...option, disabled: true }))} label="Opción" />);
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    rerender(<SelectControl options={[]} label="Opción" />);
    await user.keyboard('{ArrowDown}{ArrowDown}{Home}{End}{Enter}{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
  it('conecta las refs del popup, permite selección con ratón y cierra al hacer click fuera', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<><SelectControl options={options} label="Opción" onChange={change} /><button>Fuera</button></>);
    await user.click(screen.getByRole('combobox'));
    const list = screen.getByRole('listbox');
    expect(list.style.left).not.toBe('');
    await user.click(screen.getByRole('option', { name: 'Uno' }));
    expect(change).toHaveBeenCalledWith('one', options[0], expect.objectContaining({ cause: 'mouse' }));
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Fuera'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('al resetear Informed no conserva un valor interno obsoleto', async () => {
    const user = userEvent.setup();
    function Reset() {
      const form = useFormApi();
      return <button type="button" onClick={() => form.reset()}>Reset</button>;
    }
    render(<Form><Select name="choice" options={options} placeholder="Selecciona" /><Reset /></Form>);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Uno' }));
    expect(screen.getByRole('combobox').textContent).toContain('Uno');
    await user.click(screen.getByText('Reset'));
    expect(screen.getByRole('combobox').textContent).toContain('Selecciona');
  });

  it('reconcilia opciones dinámicas y aplica fallback con igualdad de valores', async () => {
    const { rerender } = render(<Form initialValues={{ choice: 'one' }}>
      <Select name="choice" options={options} fallbackOnMissing="first" />
    </Form>);
    expect(screen.getByRole('combobox').textContent).toContain('Uno');
    rerender(<Form initialValues={{ choice: 'one' }}>
      <Select name="choice" options={[options[2]]} fallbackOnMissing="first" />
    </Form>);
    await waitFor(() => expect(screen.getByRole('combobox').textContent).toContain('Tres'));
  });
});

describe('componentes auxiliares', () => {
  it('Dropzone elimina solo el archivo seleccionado y notifica valores actualizados', async () => {
    const user = userEvent.setup();
    const remove = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn();
    render(<Dropzone maxFiles={1} onDelete={remove} getValues={values}
      initialValues={[{ id: 'synthetic-file', preview: 'blob:synthetic-preview' }]} />);
    await user.click(screen.getByRole('button', { name: 'Eliminar archivo' }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith('synthetic-file'));
    await waitFor(() => expect(values).toHaveBeenLastCalledWith([]));
    expect(screen.queryByRole('img')).toBeNull();
  });
  it('carga el resto de componentes y sus CSS Modules sin imports pendientes', () => {
    for (const component of [Dropzone, BulkActions, ToolTip, BlogEditor]) expect(typeof component).toBe('function');
  });
  it('ToolTip funciona con React 19 y muestra el contenido al activarlo', async () => {
    const user = userEvent.setup();
    render(<ToolTip content="Ayuda de demostración" />);
    await user.click(screen.getByRole('button', { name: 'Más información' }));
    await waitFor(() => expect(screen.getByRole('tooltip').textContent).toContain('Ayuda de demostración'));
  });
  it('Collapsible admite estado controlado sin copiar props a estado', async () => {
    const toggle = vi.fn();
    const { rerender } = render(<Collapsible title="Ver más" isOpen={false} onToggle={toggle}>Contenido</Collapsible>);
    fireEvent.click(screen.getByRole('button'));
    expect(toggle).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false');
    rerender(<Collapsible title="Ver más" isOpen onToggle={toggle}>Contenido</Collapsible>);
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true');
  });
  it('Dialog enfoca el panel, cierra con Escape y restaura el scroll', () => {
    const close = vi.fn();
    const { unmount } = render(<Dialog isOpen onClose={close}><button>Acción</button></Dialog>);
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
