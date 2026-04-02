import { Helmet } from 'react-helmet-async';

/**
 * Component to inject structured data (JSON-LD) into page head
 */
const StructuredData = ({ data }) => {
    if (!data) return null;

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(data)}
            </script>
        </Helmet>
    );
};

export default StructuredData;
