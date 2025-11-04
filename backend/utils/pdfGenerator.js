import PdfDocument from 'pdfkit';

export function generateRoadmapPDF(roadmapData, skillGaps) {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PdfDocument({
                margin: 50,
                size: 'A4'
            });

            // Collection of buffers
            const chunks = [];

            // Collect the data
            doc.on('data', chunk => chunks.push(chunk));

            // When document is done being written, resolve with the buffer
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // PDF Header
            doc.font('Helvetica-Bold')
                .fontSize(24)
                .text('Your Learning Roadmap', { align: 'center' })
                .moveDown();

            // Current Skills Section
            doc.fontSize(18)
                .text('Current Skills Assessment', { underline: true })
                .moveDown(0.5);

            doc.fontSize(12);
            skillGaps.currentSkillsAssessment.strengths.forEach(skill => {
                doc.text(`• ${skill}`);
            });

            doc.moveDown()
                .fontSize(14)
                .text('Skills Relevance:', { underline: true })
                .fontSize(12)
                .text(skillGaps.currentSkillsAssessment.relevance)
                .moveDown();

            // Skills to Develop Section
            doc.fontSize(18)
                .text('Skills to Develop', { underline: true })
                .moveDown(0.5);

            skillGaps.missingSkills.forEach(skill => {
                doc.fontSize(14)
                    .text(skill.skill)
                    .fontSize(12)
                    .text(`Priority: ${skill.priority}`)
                    .text(`Time to Acquire: ${skill.timeToAcquire}`)
                    .text(`Impact: ${skill.impact}`)
                    .moveDown(0.5);
            });

            // Learning Roadmap Section
            doc.fontSize(18)
                .text('Learning Roadmap', { underline: true })
                .moveDown(0.5)
                .fontSize(14)
                .text(`Total Duration: ${roadmapData.estimatedTotalDuration}`)
                .moveDown();

            // Phases
            roadmapData.phases.forEach((phase, index) => {
                // Phase Header
                doc.fontSize(16)
                    .text(`Phase ${phase.phase}: ${phase.title}`)
                    .fontSize(12)
                    .text(`Duration: ${phase.duration}`)
                    .moveDown(0.5);

                // Focus Areas
                doc.fontSize(14)
                    .text('Focus Areas:')
                    .fontSize(12);
                phase.focusAreas.forEach(area => {
                    doc.text(`• ${area}`);
                });
                doc.moveDown(0.5);

                // Skills
                phase.skills.forEach(skill => {
                    doc.fontSize(14)
                        .text(skill.skill)
                        .fontSize(12)
                        .text(`Target Level: ${skill.level}`)
                        .moveDown(0.5);

                    // Resources
                    doc.text('Learning Resources:');
                    skill.resources.forEach(resource => {
                        doc.text(`• ${resource.name} (${resource.type})`)
                            .text(`  Platform: ${resource.platform}`)
                            .text(`  Duration: ${resource.duration}`)
                            .text(`  Cost: ${resource.cost}`)
                            .moveDown(0.25);
                    });

                    // Projects
                    if (skill.projects && skill.projects.length > 0) {
                        doc.moveDown(0.25)
                            .text('Practice Projects:');
                        skill.projects.forEach(project => {
                            doc.text(`• ${project.title}`)
                                .text(`  ${project.description}`)
                                .text(`  Difficulty: ${project.difficulty}`)
                                .moveDown(0.25);
                        });
                    }
                });

                // Milestones
                doc.moveDown(0.5)
                    .fontSize(14)
                    .text('Milestones:')
                    .fontSize(12);
                phase.milestones.forEach(milestone => {
                    doc.text(`• ${milestone}`);
                });

                doc.moveDown();
            });

            // Tips and Notes
            doc.fontSize(18)
                .text('Tips for Success', { underline: true })
                .moveDown(0.5)
                .fontSize(12)
                .text('• Set aside dedicated time each day for learning')
                .text('• Focus on hands-on practice and project work')
                .text('• Join relevant online communities for support')
                .text('• Track your progress regularly')
                .text('• Take breaks and avoid burnout')
                .moveDown();

            // Footer
            doc.fontSize(10)
                .text('Generated by CareerCatalyst - Your Career Development Partner', {
                    align: 'center',
                    color: 'grey'
                });

            // Finalize the PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}