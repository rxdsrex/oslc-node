import { Namespace } from 'rdflib';

const Namespaces = {
  // RDF Namespaces
  FOAF: Namespace('http://xmlns.com/foaf/0.1/'),

  RDF: Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),

  RDFS: Namespace('http://www.w3.org/2000/01/rdf-schema#'),

  OWL: Namespace('http://www.w3.org/2002/07/owl#'),

  DC: Namespace('http://purl.org/dc/elements/1.1/'),

  RSS: Namespace('http://purl.org/rss/1.0/'),

  XSD: Namespace('http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt-'),

  CONTACT: Namespace('http://www.w3.org/2000/10/swap/pim/contact#'),

  OSLC: Namespace('http://open-services.net/ns/core#'),

  OSLCCM: Namespace('http://open-services.net/ns/cm#'),

  OSLCAM: Namespace('http://open-services.net/ns/am#'),

  OSLCRM: Namespace('http://open-services.net/ns/rm#'),

  OSLCQM: Namespace('http://open-services.net/ns/qm#'),

  DCTERMS: Namespace('http://purl.org/dc/terms/'),

  OSLCCM10: Namespace('http://open-services.net/xmlns/cm/1.0/'),

  OSLCRM10: Namespace('http://open-services.net/xmlns/rm/1.0/'),

  OSLCQM10: Namespace('http://open-services.net/xmlns/qm/1.0/'),

  JD: Namespace('http://jazz.net/xmlns/prod/jazz/discovery/1.0/'),

  JDF: Namespace('http://jazz.net/xmlns/prod/jazz/jfs/1.0/'),

  JAZZRM: Namespace('http://jazz.net/ns/rm#'),

  RMTYPES: Namespace('http://www.ibm.com/xmlns/rdm/types/'),

  RRMNAV: Namespace('http://com.ibm.rdm/navigation#'),

  PROCESS: Namespace('http://jazz.net/ns/process#'),

  RQMPROCESS: Namespace('http://jazz.net/xmlns/prod/jazz/rqm/process/1.0/'),

  RTCCM: Namespace('http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/'),

  RTCEXT: Namespace('http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/'),

  // XML Namespaces
  JP06: 'http://jazz.net/xmlns/prod/jazz/process/0.6/',

  NS2: 'http://jazz.net/xmlns/alm/qm/v0.1/',

  NS3: 'http://purl.org/dc/elements/1.1/',

  NS4: 'http://jazz.net/xmlns/prod/jazz/process/0.6/',

  XSI: 'http://www.w3.org/2001/XMLSchema-instance',
};

Object.freeze(Namespaces);

export default Namespaces;
