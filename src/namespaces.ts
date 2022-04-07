import { Namespace } from 'rdflib';

const Namespaces = {
  // RDF Namespaces

  /** http://xmlns.com/foaf/0.1/ */
  FOAF: Namespace('http://xmlns.com/foaf/0.1/'),

  /** http://www.w3.org/1999/02/22-rdf-syntax-ns# */
  RDF: Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),

  /** http://www.w3.org/2000/01/rdf-schema# */
  RDFS: Namespace('http://www.w3.org/2000/01/rdf-schema#'),

  /** http://www.w3.org/2002/07/owl# */
  OWL: Namespace('http://www.w3.org/2002/07/owl#'),

  /** http://purl.org/dc/elements/1.1/ */
  DC: Namespace('http://purl.org/dc/elements/1.1/'),

  /** http://purl.org/rss/1.0/ */
  RSS: Namespace('http://purl.org/rss/1.0/'),

  /** http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt- */
  XSD: Namespace('http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt-'),

  /** http://www.w3.org/2000/10/swap/pim/contact# */
  CONTACT: Namespace('http://www.w3.org/2000/10/swap/pim/contact#'),

  /** http://open-services.net/ns/core# */
  OSLC: Namespace('http://open-services.net/ns/core#'),

  /** http://open-services.net/ns/cm# */
  OSLCCM: Namespace('http://open-services.net/ns/cm#'),

  /** http://open-services.net/ns/am# */
  OSLCAM: Namespace('http://open-services.net/ns/am#'),

  /** http://open-services.net/ns/rm# */
  OSLCRM: Namespace('http://open-services.net/ns/rm#'),

  /** http://open-services.net/ns/qm# */
  OSLCQM: Namespace('http://open-services.net/ns/qm#'),

  /** http://purl.org/dc/terms/ */
  DCTERMS: Namespace('http://purl.org/dc/terms/'),

  /** http://open-services.net/xmlns/cm/1.0/ */
  OSLCCM10: Namespace('http://open-services.net/xmlns/cm/1.0/'),

  /** http://open-services.net/xmlns/rm/1.0/ */
  OSLCRM10: Namespace('http://open-services.net/xmlns/rm/1.0/'),

  /** http://open-services.net/xmlns/qm/1.0/ */
  OSLCQM10: Namespace('http://open-services.net/xmlns/qm/1.0/'),

  /** http://jazz.net/xmlns/prod/jazz/discovery/1.0/ */
  JD: Namespace('http://jazz.net/xmlns/prod/jazz/discovery/1.0/'),

  /** http://jazz.net/xmlns/prod/jazz/jfs/1.0/ */
  JDF: Namespace('http://jazz.net/xmlns/prod/jazz/jfs/1.0/'),

  /** http://jazz.net/ns/rm# */
  JAZZRM: Namespace('http://jazz.net/ns/rm#'),

  /** http://www.ibm.com/xmlns/rdm/types/ */
  RMTYPES: Namespace('http://www.ibm.com/xmlns/rdm/types/'),

  /** http://com.ibm.rdm/navigation# */
  RRMNAV: Namespace('http://com.ibm.rdm/navigation#'),

  /** http://jazz.net/ns/process# */
  PROCESS: Namespace('http://jazz.net/ns/process#'),

  /** http://jazz.net/xmlns/prod/jazz/rqm/process/1.0/ */
  RQMPROCESS: Namespace('http://jazz.net/xmlns/prod/jazz/rqm/process/1.0/'),

  /** http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/ */
  RTCCM: Namespace('http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/'),

  /** http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/ */
  RTCEXT: Namespace('http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/'),

  // XML Namespaces

  /** http://jazz.net/xmlns/prod/jazz/process/0.6/ */
  JP06: 'http://jazz.net/xmlns/prod/jazz/process/0.6/',

  /** http://jazz.net/xmlns/alm/qm/v0.1/ */
  NS2: 'http://jazz.net/xmlns/alm/qm/v0.1/',

  /** http://purl.org/dc/elements/1.1/ */
  NS3: 'http://purl.org/dc/elements/1.1/',

  /** http://jazz.net/xmlns/prod/jazz/process/0.6/ */
  NS4: 'http://jazz.net/xmlns/prod/jazz/process/0.6/',

  /** http://www.w3.org/2001/XMLSchema-instance */
  XSI: 'http://www.w3.org/2001/XMLSchema-instance',
};

Object.freeze(Namespaces);

export default Namespaces;
