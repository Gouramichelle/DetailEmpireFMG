import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '../src/components/Contact';

describe('Contact form', () => {
  const getControls = () => ({
    name: screen.getByPlaceholderText('Tu Nombre *'),
    email: screen.getByPlaceholderText('Tu Email *'),
    phone: screen.getByPlaceholderText('Tu Celular *'),
    message: screen.getByPlaceholderText('Escribe un mensaje *'),
    submit: screen.getByRole('button', { name: /enviar mensaje/i })
  });

  it('renderiza encabezados y botón de envío', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: /contáctanos/i })).toBeInTheDocument();
    expect(screen.getByText(/envíanos cualquier consulta o comentario/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
  });

  it('muestra errores de validación cuando se envía vacío', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    const { submit } = getControls();

    await user.click(submit);

    expect(await screen.findByText('Debes ingresar tu nombre.')).toBeInTheDocument();
    expect(screen.getByText('Debes ingresar un email válido.')).toBeInTheDocument();
    expect(screen.getByText('Debes ingresar tu número de celular.')).toBeInTheDocument();
    expect(screen.getByText('Debes ingresar un mensaje.')).toBeInTheDocument();

    const { name, email, phone, message } = getControls();
    expect(name).toHaveClass('is-invalid');
    expect(email).toHaveClass('is-invalid');
    expect(phone).toHaveClass('is-invalid');
    expect(message).toHaveClass('is-invalid');

    expect(screen.queryByText(/tu mensaje se envió correctamente/i)).toBeNull();
  });

  it('valida email incorrecto pero acepta los demás campos correctos', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    const { name, email, phone, message, submit } = getControls();

    await user.type(name, 'Pancho');
    await user.type(email, 'correo-malo');
    await user.type(phone, '987654321');
    await user.type(message, 'Hola, quiero más info.');
    await user.click(submit);

    expect(await screen.findByText('Debes ingresar un email válido.')).toBeInTheDocument();
    expect(screen.queryByText('Debes ingresar tu nombre.')).toBeNull();
    expect(screen.queryByText('Debes ingresar tu número de celular.')).toBeNull();
    expect(screen.queryByText('Debes ingresar un mensaje.')).toBeNull();
  });

  it('al escribir en un campo con error, limpia SOLO ese error y su clase is-invalid', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    const { email, submit } = getControls();

    await user.click(submit);
    expect(await screen.findByText('Debes ingresar un email válido.')).toBeInTheDocument();
    expect(email).toHaveClass('is-invalid');

    await user.type(email, 'a@a.com');

    expect(screen.queryByText('Debes ingresar un email válido.')).toBeNull();
    expect(email).not.toHaveClass('is-invalid');
  });

  it('con datos válidos: muestra mensaje de éxito y resetea los campos', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    const { name, email, phone, message, submit } = getControls();

    await user.type(name, 'Rulo');
    await user.type(email, 'rulo@mail.com');
    await user.type(phone, '912345678');
    await user.type(message, 'Quiero cotizar un servicio.');
    await user.click(submit);

    expect(await screen.findByText('✅ Tu mensaje se envió correctamente.')).toBeInTheDocument();

    // ✅ Cambio importante: usamos .value en lugar de toHaveValue()
    expect(name.value).toBe('');
    expect(email.value).toBe('');
    expect(phone.value).toBe('');
    expect(message.value).toBe('');
  });
});
