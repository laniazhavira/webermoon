export const initialNodes = [
    {
      id: '1',
      type: 'hyperLink',
      data: { label: 
        <label>
          Project Deployment <br />
          OLT 2025
        </label>, link: '/tabel3', type: 'input' },
      position: { x: -600, y: 400 },
    },
    {
      id: '2',
      type: 'hyperLink',
      data: { label: 'Not Yet', link: '/tabel3/notyet', type: 'default', value:'' },
      position: { x: 200, y: -13 },
    },
    {
      id: '3',
      type: 'hyperLink',
      data: { label: 'Survey', link: '/tabel3/survey', type:'default' },
      position: { x: 200, y: 238 },
    },
    {
      id: '4',
      type: 'hyperLink',
      data: { label: 'Delivery', link: '/tabel3/delivery', type: 'default' },
      position: { x: 200, y: 489 },
    },
    {
      id: '5',
      type: 'hyperLink',
      data: { label: 'Instalasi', link: '/tabel3/instalasi', type: 'default' },
      position: { x: 200, y: 740 },
    },
    {
      id: '6',
      type: 'hyperLink',
      data: { label: 'Integrasi', link: '/tabel3/integrasi', type: 'default' },
      position: { x: 200, y: 991 },
    },
    {
      id: '7',
      type: 'hyperLink',
      data: { label: 'Drop', link: '/about', type: 'output', parent: 'Not Yet' },
      position: { x: 650, y: -50 },
    },
    {
      id: '8',
      type: 'hyperLink',
      data: { label: 'Relokasi', link: '/about', type: 'output', parent: 'Not Yet' },
      position: { x: 650, y: 50 },
    },
    {
      id: '9',
      type: 'hyperLink',
      data: { label: 'Plan', link: '/about', type: 'output', parent: 'Survey' },
      position: { x: 650, y: 200 },
    },
    {
      id: '10',
      type: 'hyperLink',
      data: { label: 'Realisasi', link: '/about', type: 'output', parent: 'Survey' },
      position: { x: 650, y: 300 },
    },
    {
      id: '11',
      type: 'hyperLink',
      data: { label: 'Plan', link: '/about', type: 'output', parent: 'Delivery' },
      position: { x: 650, y: 450 },
    },
    {
      id: '12',
      type: 'hyperLink',
      data: { label: 'Realisasi', link: '/about', type: 'output', parent: 'Delivery' },
      position: { x: 650, y: 550 },
    },
    {
      id: '13',
      type: 'hyperLink',
      data: { label: 'Plan', link: '/about', type: 'output', parent: 'Instalasi' },
      position: { x: 650, y: 700 },
    },
    {
      id: '14',
      type: 'hyperLink',
      data: { label: 'Realisasi', link: '/about', type: 'output', parent: 'Instalasi' },
      position: { x: 650, y: 800 },
    },
    {
      id: '15',
      type: 'hyperLink',
      data: { label: 'Plan', link: '/about', type: 'output', parent: 'Integrasi' },
      position: { x: 650, y: 950 },
    },
    {
      id: '16',
      type: 'hyperLink',
      data: { label: 'Realisasi', link: '/about', type: 'output' , parent: 'Integrasi'},
      position: { x: 650, y: 1050 },
    },
    {
      id: '17',
      type: 'filter',
      position: { x: 1200, y: 0 },
    },
];