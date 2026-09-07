import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  WidthType,
  PageOrientation,
  convertInchesToTwip,
  convertMillimetersToTwip,
} from 'docx';
import type { PlanificacionClase, InstrumentoEvaluacion, RecursoMultimodal } from '../types';

function saveDocument(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function formatUrlForWord(url: string): string {
  if (!url) return '';
  return url.replace(/([/\\?&=#._%-])/g, '$1\u200B');
}

export async function exportToWord(
  planData?: PlanificacionClase | null,
  rubricData?: InstrumentoEvaluacion | null,
  multimodalData?: RecursoMultimodal[] | null,
  onErrorNotification?: (msg: string) => void
): Promise<void> {
  if (!planData || !planData.encabezado) {
    if (onErrorNotification) onErrorNotification('Datos de planificación incompletos.');
    return;
  }

  const enc = planData.encabezado;
  const filas = planData.desarrollo_curricular || [];

  try {
    const headingParagraphs: Paragraph[] = [];

    const centroEducativoText = (enc.centro_educativo || '').trim();
    if (centroEducativoText) {
      headingParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: centroEducativoText.toUpperCase(),
              bold: true,
              size: 28, // 14pt
              font: 'Arial',
            }),
          ],
        })
      );
    }

    const lugarText = (enc.lugar || '').trim();
    if (lugarText) {
      headingParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: lugarText.toUpperCase(),
              bold: true,
              size: 24, // 12pt
              font: 'Arial',
            }),
          ],
        })
      );
    }

    const carreraText = (enc.carrera || '').trim();
    if (carreraText) {
      headingParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: carreraText.toUpperCase(),
              bold: true,
              size: 24, // 12pt
              font: 'Arial',
            }),
          ],
        })
      );
    }

    const gradoSeccionText = [enc.grado || '', enc.seccion || ''].filter(Boolean).join(' ');

    const table1 = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Grado', bold: true, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: gradoSeccionText, font: 'Arial', size: 22 })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Curso', bold: true, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: enc.curso || '', font: 'Arial', size: 22 })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Docente', bold: true, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: enc.nombre_docente || '', font: 'Arial', size: 22 })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Duración', bold: true, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: enc.duracion || '', font: 'Arial', size: 22 })],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    const spaceParagraph1 = new Paragraph({
      spacing: { before: 240, after: 120 },
    });

    const table2Headers = new TableRow({
      children: [
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Competencia', bold: true, font: 'Arial', size: 22 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Indicador de Logro', bold: true, font: 'Arial', size: 22 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Contenidos', bold: true, font: 'Arial', size: 22 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Actividades de aprendizaje', bold: true, font: 'Arial', size: 22 })],
            }),
          ],
        }),
      ],
    });

    const table2Rows = [table2Headers];

    filas.forEach((fila) => {
      const competenciaParagraphs = [
        new Paragraph({
          children: [new TextRun({ text: fila.competencia || '', font: 'Arial', size: 20 })],
        }),
      ];

      const indicadores = fila.indicadores_logro || [];
      const indicadorParagraphs: Paragraph[] = [];
      const contenidosParagraphs: Paragraph[] = [];

      indicadores.forEach((indObj) => {
        if (indObj.indicador) {
          indicadorParagraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [new TextRun({ text: indObj.indicador, font: 'Arial', size: 20 })],
            })
          );
        }
        if (indObj.contenidos && indObj.contenidos.length > 0) {
          indObj.contenidos.forEach((c) => {
            if (c) {
              contenidosParagraphs.push(
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { after: 40 },
                  children: [new TextRun({ text: c, font: 'Arial', size: 20 })],
                })
              );
            }
          });
        }
      });

      if (indicadorParagraphs.length === 0) {
        indicadorParagraphs.push(new Paragraph({ children: [] }));
      }
      if (contenidosParagraphs.length === 0) {
        contenidosParagraphs.push(new Paragraph({ children: [] }));
      }

      const activitiesParagraphs: Paragraph[] = [];
      (fila.actividades_aprendizaje || []).forEach((act) => {
        const faseLabel = act.fase ? `[${act.fase.toUpperCase()}] ` : '';
        activitiesParagraphs.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              ...(faseLabel
                ? [
                    new TextRun({
                      text: faseLabel,
                      bold: true,
                      font: 'Arial',
                      size: 18,
                    }),
                  ]
                : []),
              new TextRun({
                text: act.descripcion || '',
                font: 'Arial',
                size: 20,
              }),
            ],
          })
        );
      });

      if (activitiesParagraphs.length === 0) {
        activitiesParagraphs.push(new Paragraph({ children: [] }));
      }

      table2Rows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: competenciaParagraphs,
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: indicadorParagraphs,
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: contenidosParagraphs,
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: activitiesParagraphs,
            }),
          ],
        })
      );
    });

    const table2 = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table2Rows,
    });

    const docChildren: any[] = [
      ...headingParagraphs,
      table1,
      spaceParagraph1,
      table2,
    ];

    const planTools: any[] = rubricData?.herramientas && rubricData.herramientas.length > 0
      ? rubricData.herramientas
      : (rubricData?.instrumento_generado?.criterios ? [{
          tipo: rubricData.tipo || '',
          titulo: rubricData.titulo || '',
          escala: rubricData.instrumento_generado.escala || [],
          criterios: rubricData.instrumento_generado.criterios || []
        }] : (rubricData ? [rubricData] : []));

    if (planTools && planTools.length > 0) {
      const validTools = planTools.filter((t: any) => {
        const crits = t?.criterios || t?.instrumento_generado?.criterios;
        return crits && Array.isArray(crits) && crits.length > 0;
      });

      if (validTools.length > 0) {
        docChildren.push(
          new Paragraph({
            pageBreakBefore: true,
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: 'INSTRUMENTOS DE EVALUACIÓN',
                bold: true,
                size: 28,
                font: 'Arial',
                color: '000000',
              }),
            ],
          })
        );

        validTools.forEach((inst: any, idx: number) => {
          const tituloTool = (inst.titulo || '').trim();
          const fallbackType = inst.tipo ? (inst.tipo).toUpperCase() : '';
          const headerLabel = tituloTool || fallbackType;

          docChildren.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 160, after: 80 },
              children: [
                new TextRun({
                  text: `${idx + 1}. ${headerLabel}`,
                  bold: true,
                  size: 22,
                  font: 'Arial',
                }),
              ],
            })
          );

          const scale: string[] = (Array.isArray(inst.escala) && inst.escala.length > 0)
            ? inst.escala
            : (inst.instrumento_generado?.escala || []);

          const criterios: any[] = Array.isArray(inst.criterios)
            ? inst.criterios
            : (inst.instrumento_generado?.criterios || []);

          const tableHeaders = [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Criterio de Evaluación',
                      bold: true,
                      font: 'Arial',
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
            ...scale.map(
              (esc: string) =>
                new TableCell({
                  width: {
                    size: 65 / (scale.length || 1),
                    type: WidthType.PERCENTAGE,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: esc || '',
                          bold: true,
                          font: 'Arial',
                          size: 20,
                        }),
                      ],
                    }),
                  ],
                })
            ),
          ];

          const tableRows = [new TableRow({ children: tableHeaders })];

          criterios.forEach((crit: any) => {
            const critName = crit.nombre || crit.aspecto_o_criterio || crit.criterio || '';
            const defs = crit.definiciones || [];

            const cells = [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: critName,
                        bold: false,
                        font: 'Arial',
                        size: 20,
                      }),
                    ],
                  }),
                ],
              }),
              ...scale.map((_: string, eIdx: number) => {
                const cellContent = defs[eIdx] || '';
                return new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: cellContent,
                          font: 'Arial',
                          size: 20,
                        }),
                      ],
                    }),
                  ],
                });
              }),
            ];
            tableRows.push(new TableRow({ children: cells }));
          });

          docChildren.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            })
          );

          docChildren.push(new Paragraph({ spacing: { after: 120 } }));
        });
      }
    }

    if (multimodalData && Array.isArray(multimodalData) && multimodalData.length > 0) {
      docChildren.push(
        new Paragraph({
          pageBreakBefore: true,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({
              text: 'RECURSOS Y CONTENIDOS MULTIMODALES',
              bold: true,
              size: 28,
              font: 'Arial',
              color: '000000',
            }),
          ],
        })
      );

      const colWidth1 = 1944;
      const colWidth2 = 7128;
      const colWidth3 = 3888;

      const resourceTableHeaders = new TableRow({
        children: [
          new TableCell({
            width: { size: colWidth1, type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Formato', bold: true, font: 'Arial', size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: colWidth2, type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Título', bold: true, font: 'Arial', size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: colWidth3, type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Enlace', bold: true, font: 'Arial', size: 20 })],
              }),
            ],
          }),
        ],
      });

      const resourceTableRows = [resourceTableHeaders];

      multimodalData.forEach((res) => {
        const tipoText = res.tipo ? res.tipo.toUpperCase() : '';
        const tituloText = res.titulo || '';
        const urlText = formatUrlForWord(res.url || '');

        resourceTableRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: colWidth1, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: tipoText, bold: false, font: 'Arial', size: 18 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: colWidth2, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: tituloText, bold: false, font: 'Arial', size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: colWidth3, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: urlText,
                        font: 'Arial',
                        size: 18,
                        color: '0000FF',
                        underline: {},
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      });

      docChildren.push(
        new Table({
          columnWidths: [colWidth1, colWidth2, colWidth3],
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: resourceTableRows,
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: PageOrientation.LANDSCAPE,
                width: convertMillimetersToTwip(215.9),
                height: convertMillimetersToTwip(279.4),
              },
              margin: {
                top: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const rawCourseName = enc.curso || enc.carrera || enc.grado || '';
    const safeCourse = rawCourseName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    saveDocument(blob, safeCourse ? `planificacion_${safeCourse}.docx` : 'planificacion.docx');

  } catch {
    if (onErrorNotification) {
      onErrorNotification('No fue posible generar la exportación a Microsoft Word. Por favor, intenta de nuevo.');
    }
  }
}
