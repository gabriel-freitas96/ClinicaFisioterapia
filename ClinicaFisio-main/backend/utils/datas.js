const FUSO = 'America/Fortaleza';

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORARIO_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function agoraLocal() {
    const partes = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', {
            timeZone: FUSO,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        })
            .formatToParts(new Date())
            .map(parte => [parte.type, parte.value])
    );

    return {
        data: `${partes.year}-${partes.month}-${partes.day}`,
        horario: `${partes.hour}:${partes.minute}`
    };
}

function hojeLocal() {
    return agoraLocal().data;
}

function dataValida(data) {
    if (typeof data !== 'string' || !DATA_REGEX.test(data)) {
        return false;
    }

    const convertida = new Date(`${data}T00:00:00Z`);

    return (
        !Number.isNaN(convertida.getTime()) &&
        convertida.toISOString().slice(0, 10) === data
    );
}

function horarioValido(horario) {
    return typeof horario === 'string' && HORARIO_REGEX.test(horario);
}

module.exports = { agoraLocal, hojeLocal, dataValida, horarioValido };