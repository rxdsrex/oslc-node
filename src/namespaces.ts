import { Namespace } from 'rdflib';

class Namespaces {
  // RDF Namespaces
  static FOAF = Namespace('http://xmlns.com/foaf/0.1/');

  static RDF = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

  static RDFS = Namespace('http://www.w3.org/2000/01/rdf-schema#');

  static OWL = Namespace('http://www.w3.org/2002/07/owl#');

  static DC = Namespace('http://purl.org/dc/elements/1.1/');

  static RSS = Namespace('http://purl.org/rss/1.0/');

  static XSD = Namespace('http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt-');

  static CONTACT = Namespace('http://www.w3.org/2000/10/swap/pim/contact#');

  static OSLC = Namespace('http://open-services.net/ns/core#');

  static OSLCCM = Namespace('http://open-services.net/ns/cm#');

  static OSLCAM = Namespace('http://open-services.net/ns/am#');

  static OSLCRM = Namespace('http://open-services.net/ns/rm#');

  static OSLCQM = Namespace('http://open-services.net/ns/qm#');

  static DCTERMS = Namespace('http://purl.org/dc/terms/');

  static OSLCCM10 = Namespace('http://open-services.net/xmlns/cm/1.0/');

  static OSLCRM10 = Namespace('http://open-services.net/xmlns/rm/1.0/');

  static OSLCQM10 = Namespace('http://open-services.net/xmlns/qm/1.0/');

  static JD = Namespace('http://jazz.net/xmlns/prod/jazz/discovery/1.0/');

  static JDF = Namespace('http://jazz.net/xmlns/prod/jazz/jfs/1.0/');

  static JAZZRM = Namespace('http://jazz.net/ns/rm#');

  static RMTYPES = Namespace('http://www.ibm.com/xmlns/rdm/types/');

  static RRMNAV = Namespace('http://com.ibm.rdm/navigation#');

  static PROCESS = Namespace('http://jazz.net/ns/process#');

  static RQMPROCESS = Namespace('http://jazz.net/xmlns/prod/jazz/rqm/process/1.0/');

  static RTCCM = Namespace('http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/');

  static RTCEXT = Namespace('http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/');

  // XML Namespaces
  static JP06 = 'http://jazz.net/xmlns/prod/jazz/process/0.6/';

  static NS2 = 'http://jazz.net/xmlns/alm/qm/v0.1/';

  static NS3 = 'http://purl.org/dc/elements/1.1/';

  static NS4 = 'http://jazz.net/xmlns/prod/jazz/process/0.6/';

  static XSI = 'http://www.w3.org/2001/XMLSchema-instance';
}

Object.freeze(Namespaces);

export default Namespaces;
