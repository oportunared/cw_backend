
export function omit(obj: any, ...props: any[]) {
    const result = { ...obj };
    props.forEach(function(prop) {
      delete result[prop];
    });
    return result;
};

export function makeid(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

export function isDate24HoursOrOlder(then: Date) {
    const now = new Date();
    const msBetweenDates = Math.abs(then.getTime() - now.getTime());
    // convert ms to hours  (min  sec   ms)
    const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000);
    return (hoursBetweenDates >= 24);
}

export function get_client_ip(req) {
  const ipAddress =
    req.headers['x-forwarded-for'] || // Para proxies o balanceadores de carga
    req.connection.remoteAddress || // Dirección IP del cliente directo
    req.socket.remoteAddress || // Dirección IP del cliente del socket
    req.connection.socket.remoteAddress; // Dirección IP del cliente del socket

  // La dirección IP estará en el formato '::ffff:192.168.1.1' para IPv4, así que puedes limpiarla si es necesario
  return ipAddress.replace('::ffff:', '');
}

  